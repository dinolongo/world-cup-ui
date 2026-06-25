<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import matchStadiumData from '../data/match-stadium.json'
import stadiumData from '../data/stadium-data.json'
import KnockoutMatchCard from '../components/KnockoutMatchCard.vue'
import { useBracketConnectors } from '../composables/useBracketConnectors'
import { useKnockoutPredictions } from '../composables/useKnockoutPredictions'
import { usePredictionStore } from '../stores/predictionStore'
import { getGroups, getPrediction } from '../services/api'
import { BRACKET_LAYOUT, KNOCKOUT_ROUNDS, teamCrests } from '../util/constants'

const route = useRoute()
const router = useRouter()
const predictionStore = usePredictionStore()

const loading = ref(true)
const notFound = ref(false)
const activeView = ref('knockout')
const prediction = ref(null)
const knockoutMatches = ref([])
const savedKnockoutPredictions = ref({})
const orderedGroups = ref({})
const selectedThirdPlaceGroups = ref([])

const leftBracketEl = ref(null)
const rightBracketEl = ref(null)
const bracketContainerEl = ref(null)
const stadiumMap = new Map(stadiumData.stadiums.map(s => [s.name, s]))

const {
  leftConnectorPaths,
  rightConnectorPaths,
  centerConnectorPaths,
  leftSvgViewBox,
  rightSvgViewBox,
  centerSvgViewBox,
  setCardRef,
  recalculatePaths
} = useBracketConnectors(leftBracketEl, rightBracketEl, bracketContainerEl)

const {
  finalWinner,
  finalRunnerUp,
  thirdPlaceWinner,
  getTeamCrest,
  getTeamName,
  getTeamId,
  finalMatch,
  thirdPlaceMatch,
  sf101Match,
  sf102Match,
  loadPredictions
} = useKnockoutPredictions(knockoutMatches, predictionStore)

const parseJsonField = (value) => {
  if (!value) return {}
  if (typeof value !== 'string') return value

  try {
    return JSON.parse(value)
  } catch (error) {
    console.error('Failed to parse saved bracket data:', error)
    return {}
  }
}

const groupLabel = (groupName) => groupName?.replace('_', ' ') ?? groupName

const matchesForNumbers = (nums) =>
  computed(() => nums.map(num => knockoutMatches.value.find(m => m.num === num)).filter(Boolean))

const leftRo32Matches  = matchesForNumbers(BRACKET_LAYOUT.left.ro32)
const leftRo16Matches  = matchesForNumbers(BRACKET_LAYOUT.left.ro16)
const leftQFMatches    = matchesForNumbers(BRACKET_LAYOUT.left.qf)
const rightRo32Matches = matchesForNumbers(BRACKET_LAYOUT.right.ro32)
const rightRo16Matches = matchesForNumbers(BRACKET_LAYOUT.right.ro16)
const rightQFMatches   = matchesForNumbers(BRACKET_LAYOUT.right.qf)

const groupEntries = computed(() => Object.entries(orderedGroups.value))

const getStadium = (groundName) => stadiumMap.get(groundName) ?? null

const getWinnerId = (matchNum) => {
  return savedKnockoutPredictions.value[String(matchNum)] ?? savedKnockoutPredictions.value[matchNum] ?? null
}

const getSavedGroupOrder = (currentGroups, groupStagePredictions) => {
  const savedGroups = groupStagePredictions.groups ?? {}
  const nextGroups = {}

  Object.keys(currentGroups).sort().forEach(groupName => {
    const teams = [...currentGroups[groupName]]
    const savedOrder = savedGroups[groupName]?.map(String) ?? []

    nextGroups[groupName] = savedOrder.length
      ? teams.sort((a, b) => {
          const aIndex = savedOrder.indexOf(String(a.teamId))
          const bIndex = savedOrder.indexOf(String(b.teamId))
          return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex)
        })
      : teams
  })

  return nextGroups
}

const loadBracket = async () => {
  loading.value = true
  notFound.value = false

  try {
    const [savedPrediction, currentGroupStandings] = await Promise.all([
      getPrediction(route.params.bracketId),
      getGroups()
    ])

    const groupStagePredictions = parseJsonField(savedPrediction.groupStagePredictions)
    const knockoutPredictions = parseJsonField(savedPrediction.knockoutPredictions)

    const currentGroups = {}
    currentGroupStandings.forEach(team => {
      if (!currentGroups[team.groupName]) currentGroups[team.groupName] = []
      currentGroups[team.groupName].push(team)
    })

    const nextGroups = getSavedGroupOrder(currentGroups, groupStagePredictions)
    const selectedGroups = groupStagePredictions.selectedThirdPlaceTeams ?? []

    prediction.value = savedPrediction
    savedKnockoutPredictions.value = knockoutPredictions
    orderedGroups.value = nextGroups
    selectedThirdPlaceGroups.value = selectedGroups
    knockoutMatches.value = matchStadiumData.matches
      .filter(match => KNOCKOUT_ROUNDS.has(match.round))
      .map(match => ({ ...match }))

    predictionStore.setGroups(nextGroups)
    predictionStore.setSelectedThirdPlaceTeams(
      selectedGroups
        .map(groupLetter => {
          const groupName = `GROUP_${groupLetter}`
          const team = nextGroups[groupName]?.[2]
          return team ? { groupName, team } : null
        })
        .filter(Boolean)
    )

    loadPredictions({ knockoutPredictions })
  } catch (error) {
    console.error('Failed to load bracket:', error)
    notFound.value = true
  } finally {
    loading.value = false
    if (!notFound.value) {
      await nextTick()
      requestAnimationFrame(recalculatePaths)
    }
  }
}

const returnToStandings = () => {
  router.push('/standings')
}

onMounted(async () => {
  await loadBracket()
  window.addEventListener('resize', recalculatePaths)
})

watch(activeView, async (view) => {
  if (view !== 'knockout') return

  await nextTick()
  requestAnimationFrame(recalculatePaths)
})

onUnmounted(() => {
  window.removeEventListener('resize', recalculatePaths)
})
</script>

<template>
  <div class="bracket-view-page">
    <div v-if="loading" class="state-panel">
      <v-progress-circular indeterminate color="white" size="52" />
      <p>Loading bracket...</p>
    </div>

    <div v-else-if="notFound" class="state-panel not-found">
      <h1>Bracket not found</h1>
      <v-btn color="primary" size="large" @click="returnToStandings">
        Return
      </v-btn>
    </div>

    <template v-else>
      <div class="page-header">
        <div>
          <p class="eyebrow">Saved bracket</p>
          <h1>{{ prediction.displayName }}</h1>
          <p class="bracket-id">ID: {{ prediction.bracketId }}</p>
        </div>

        <v-btn-toggle
          v-model="activeView"
          mandatory
          divided
          color="primary"
          class="view-toggle"
        >
          <v-btn value="knockout">Knockout</v-btn>
          <v-btn value="groups">Groups</v-btn>
        </v-btn-toggle>
      </div>

      <section v-if="activeView === 'groups'" class="groups-view">
        <div
          v-for="[groupName, teams] in groupEntries"
          :key="groupName"
          class="group-card"
        >
          <div class="group-title">{{ groupLabel(groupName) }}</div>
          <ol class="team-list">
            <li
              v-for="(team, index) in teams"
              :key="team.teamId"
              class="team-row"
              :class="{ selected: selectedThirdPlaceGroups.includes(groupName.replace('GROUP_', '')) && index === 2 }"
            >
              <span class="position">{{ index + 1 }}</span>
              <img
                :src="teamCrests[team.teamName]"
                :alt="team.teamName"
                class="team-crest"
                @error="$event.target.style.display = 'none'"
              />
              <span class="team-name">{{ team.teamName }}</span>
              <v-chip v-if="index === 2 && selectedThirdPlaceGroups.includes(groupName.replace('GROUP_', ''))" size="x-small" color="primary">
                Advances
              </v-chip>
            </li>
          </ol>
        </div>
      </section>

      <section v-else class="knockout-view">
        <div class="bracket-container" ref="bracketContainerEl">
          <svg class="center-connector-svg" :viewBox="centerSvgViewBox">
            <path
              v-for="path in centerConnectorPaths"
              :key="path.id"
              :d="path.d"
              fill="none"
              stroke="rgba(255,255,255,0.45)"
              stroke-width="2"
            />
          </svg>

          <div class="bracket-side left-bracket" ref="leftBracketEl">
            <svg class="connector-svg" :viewBox="leftSvgViewBox">
              <path
                v-for="path in leftConnectorPaths"
                :key="path.id"
                :d="path.d"
                fill="none"
                stroke="rgba(255,255,255,0.45)"
                stroke-width="2"
              />
            </svg>

            <div class="round-section">
              <h3>Round of 32</h3>
              <div class="matches">
                <KnockoutMatchCard
                  v-for="match in leftRo32Matches"
                  :key="match.num"
                  :match="match"
                  :match-num="match.num"
                  :team1-name="getTeamName(match.team1, match.num, match.team2)"
                  :team2-name="getTeamName(match.team2, match.num, match.team1)"
                  :team1-id="getTeamId(match.team1, match.num, match.team2)"
                  :team2-id="getTeamId(match.team2, match.num, match.team1)"
                  :stadium="getStadium(match.ground)"
                  :winner-id="getWinnerId(match.num)"
                  readonly
                  :ref="el => setCardRef(el, match.num)"
                />
              </div>
            </div>

            <div class="round-section">
              <h3>Round of 16</h3>
              <div class="matches">
                <KnockoutMatchCard
                  v-for="match in leftRo16Matches"
                  :key="match.num"
                  :match="match"
                  :match-num="match.num"
                  :team1-name="getTeamName(match.team1, match.num, match.team2)"
                  :team2-name="getTeamName(match.team2, match.num, match.team1)"
                  :team1-id="getTeamId(match.team1, match.num, match.team2)"
                  :team2-id="getTeamId(match.team2, match.num, match.team1)"
                  :stadium="getStadium(match.ground)"
                  :winner-id="getWinnerId(match.num)"
                  readonly
                  :ref="el => setCardRef(el, match.num)"
                />
              </div>
            </div>

            <div class="round-section">
              <h3>Quarter Finals</h3>
              <div class="matches">
                <KnockoutMatchCard
                  v-for="match in leftQFMatches"
                  :key="match.num"
                  :match="match"
                  :match-num="match.num"
                  :team1-name="getTeamName(match.team1, match.num, match.team2)"
                  :team2-name="getTeamName(match.team2, match.num, match.team1)"
                  :team1-id="getTeamId(match.team1, match.num, match.team2)"
                  :team2-id="getTeamId(match.team2, match.num, match.team1)"
                  :stadium="getStadium(match.ground)"
                  :winner-id="getWinnerId(match.num)"
                  readonly
                  :ref="el => setCardRef(el, match.num)"
                />
              </div>
            </div>
          </div>

          <div class="center-diamond">
            <div class="podium-summary">
              <div v-if="finalWinner" class="podium-card gold">
                <span>Champion</span>
                <div class="podium-team">
                  <img v-if="getTeamCrest(finalWinner)" :src="getTeamCrest(finalWinner)" alt="" />
                  <strong>{{ finalWinner }}</strong>
                </div>
              </div>
              <div v-if="finalRunnerUp" class="podium-card silver">
                <span>Runner-up</span>
                <div class="podium-team">
                  <img v-if="getTeamCrest(finalRunnerUp)" :src="getTeamCrest(finalRunnerUp)" alt="" />
                  <strong>{{ finalRunnerUp }}</strong>
                </div>
              </div>
              <div v-if="thirdPlaceWinner" class="podium-card bronze">
                <span>Third place</span>
                <div class="podium-team">
                  <img v-if="getTeamCrest(thirdPlaceWinner)" :src="getTeamCrest(thirdPlaceWinner)" alt="" />
                  <strong>{{ thirdPlaceWinner }}</strong>
                </div>
              </div>
            </div>

            <div class="diamond-row final-row">
              <h2>Final</h2>
              <KnockoutMatchCard
                v-if="finalMatch"
                :match="finalMatch"
                :match-num="finalMatch.num"
                :team1-name="getTeamName(finalMatch.team1, finalMatch.num, finalMatch.team2)"
                :team2-name="getTeamName(finalMatch.team2, finalMatch.num, finalMatch.team1)"
                :team1-id="getTeamId(finalMatch.team1, finalMatch.num, finalMatch.team2)"
                :team2-id="getTeamId(finalMatch.team2, finalMatch.num, finalMatch.team1)"
                :stadium="getStadium(finalMatch.ground)"
                :winner-id="getWinnerId(finalMatch.num)"
                readonly
                class="final-card"
                :ref="el => setCardRef(el, finalMatch.num)"
              />
            </div>

            <div class="diamond-row semi-finals-row">
              <div class="semi-final-left">
                <h3>Semi Final</h3>
                <KnockoutMatchCard
                  v-if="sf101Match"
                  :match="sf101Match"
                  :match-num="sf101Match.num"
                  :team1-name="getTeamName(sf101Match.team1, sf101Match.num, sf101Match.team2)"
                  :team2-name="getTeamName(sf101Match.team2, sf101Match.num, sf101Match.team1)"
                  :team1-id="getTeamId(sf101Match.team1, sf101Match.num, sf101Match.team2)"
                  :team2-id="getTeamId(sf101Match.team2, sf101Match.num, sf101Match.team1)"
                  :stadium="getStadium(sf101Match.ground)"
                  :winner-id="getWinnerId(sf101Match.num)"
                  readonly
                  :ref="el => setCardRef(el, sf101Match.num)"
                />
              </div>
              <div class="semi-final-right">
                <h3>Semi Final</h3>
                <KnockoutMatchCard
                  v-if="sf102Match"
                  :match="sf102Match"
                  :match-num="sf102Match.num"
                  :team1-name="getTeamName(sf102Match.team1, sf102Match.num, sf102Match.team2)"
                  :team2-name="getTeamName(sf102Match.team2, sf102Match.num, sf102Match.team1)"
                  :team1-id="getTeamId(sf102Match.team1, sf102Match.num, sf102Match.team2)"
                  :team2-id="getTeamId(sf102Match.team2, sf102Match.num, sf102Match.team1)"
                  :stadium="getStadium(sf102Match.ground)"
                  :winner-id="getWinnerId(sf102Match.num)"
                  readonly
                  :ref="el => setCardRef(el, sf102Match.num)"
                />
              </div>
            </div>

            <div class="diamond-row third-place-row">
              <h2>Third Place</h2>
              <KnockoutMatchCard
                v-if="thirdPlaceMatch"
                :match="thirdPlaceMatch"
                :match-num="thirdPlaceMatch.num"
                :team1-name="getTeamName(thirdPlaceMatch.team1, thirdPlaceMatch.num, thirdPlaceMatch.team2)"
                :team2-name="getTeamName(thirdPlaceMatch.team2, thirdPlaceMatch.num, thirdPlaceMatch.team1)"
                :team1-id="getTeamId(thirdPlaceMatch.team1, thirdPlaceMatch.num, thirdPlaceMatch.team2)"
                :team2-id="getTeamId(thirdPlaceMatch.team2, thirdPlaceMatch.num, thirdPlaceMatch.team1)"
                :stadium="getStadium(thirdPlaceMatch.ground)"
                :winner-id="getWinnerId(thirdPlaceMatch.num)"
                readonly
                :ref="el => setCardRef(el, thirdPlaceMatch.num)"
              />
            </div>
          </div>

          <div class="bracket-side right-bracket" ref="rightBracketEl">
            <svg class="connector-svg" :viewBox="rightSvgViewBox">
              <path
                v-for="path in rightConnectorPaths"
                :key="path.id"
                :d="path.d"
                fill="none"
                stroke="rgba(255,255,255,0.45)"
                stroke-width="2"
              />
            </svg>

            <div class="round-section">
              <h3>Round of 32</h3>
              <div class="matches">
                <KnockoutMatchCard
                  v-for="match in rightRo32Matches"
                  :key="match.num"
                  :match="match"
                  :match-num="match.num"
                  :team1-name="getTeamName(match.team1, match.num, match.team2)"
                  :team2-name="getTeamName(match.team2, match.num, match.team1)"
                  :team1-id="getTeamId(match.team1, match.num, match.team2)"
                  :team2-id="getTeamId(match.team2, match.num, match.team1)"
                  :stadium="getStadium(match.ground)"
                  :winner-id="getWinnerId(match.num)"
                  readonly
                  :ref="el => setCardRef(el, match.num)"
                />
              </div>
            </div>

            <div class="round-section">
              <h3>Round of 16</h3>
              <div class="matches">
                <KnockoutMatchCard
                  v-for="match in rightRo16Matches"
                  :key="match.num"
                  :match="match"
                  :match-num="match.num"
                  :team1-name="getTeamName(match.team1, match.num, match.team2)"
                  :team2-name="getTeamName(match.team2, match.num, match.team1)"
                  :team1-id="getTeamId(match.team1, match.num, match.team2)"
                  :team2-id="getTeamId(match.team2, match.num, match.team1)"
                  :stadium="getStadium(match.ground)"
                  :winner-id="getWinnerId(match.num)"
                  readonly
                  :ref="el => setCardRef(el, match.num)"
                />
              </div>
            </div>

            <div class="round-section">
              <h3>Quarter Finals</h3>
              <div class="matches">
                <KnockoutMatchCard
                  v-for="match in rightQFMatches"
                  :key="match.num"
                  :match="match"
                  :match-num="match.num"
                  :team1-name="getTeamName(match.team1, match.num, match.team2)"
                  :team2-name="getTeamName(match.team2, match.num, match.team1)"
                  :team1-id="getTeamId(match.team1, match.num, match.team2)"
                  :team2-id="getTeamId(match.team2, match.num, match.team1)"
                  :stadium="getStadium(match.ground)"
                  :winner-id="getWinnerId(match.num)"
                  readonly
                  :ref="el => setCardRef(el, match.num)"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.bracket-view-page {
  min-height: 100vh;
  background: #1a1a1a;
  padding: 32px 20px 48px;
}

.state-panel {
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  color: white;
  text-align: center;
}

.state-panel h1 {
  font-size: 32px;
  margin: 0;
}

.page-header {
  width: 100%;
  max-width: 1800px;
  margin: 0 auto 24px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
}

.eyebrow {
  color: rgba(255, 255, 255, 0.65);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0;
  margin: 0 0 6px;
  text-transform: uppercase;
}

h1 {
  color: white;
  font-size: 32px;
  font-weight: 700;
  margin: 0;
}

.bracket-id {
  color: rgba(255, 255, 255, 0.7);
  margin: 6px 0 0;
}

.view-toggle {
  flex-shrink: 0;
  overflow: hidden;
  max-width: 100%;
}

.view-toggle :deep(.v-btn) {
  min-width: 112px;
}

.groups-view {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 18px;
}

.group-card {
  background: #2d2d2d;
  border: 1px solid #3d3d3d;
  border-radius: 8px;
  overflow: hidden;
}

.group-title {
  background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%);
  color: white;
  font-weight: 700;
  padding: 12px 16px;
}

.team-list {
  list-style: none;
  padding: 8px;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.team-row {
  min-height: 44px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  background: #3a3a3a;
  border: 1px solid #444;
  border-radius: 8px;
  color: #e8e8e8;
}

.team-row.selected {
  border-color: #6ea8fe;
  background: #233a57;
}

.position {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #1e3a5f;
  color: white;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}

.team-crest {
  width: 28px;
  height: 28px;
  object-fit: contain;
  flex-shrink: 0;
}

.team-name {
  font-size: 14px;
  font-weight: 600;
  flex: 1;
  min-width: 0;
}

.podium-summary {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.podium-card {
  min-height: 52px;
  border-radius: 8px;
  padding: 8px 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.podium-card span {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  color: rgba(0, 0, 0, 0.7);
}

.podium-card strong {
  color: #1a1a1a;
  font-size: 14px;
  line-height: 1.15;
}

.podium-card img {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.podium-team {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  min-width: 0;
  text-align: right;
}

.gold {
  background: linear-gradient(135deg, #ffd700 0%, #ffecb3 100%);
}

.silver {
  background: linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%);
}

.bronze {
  background: linear-gradient(135deg, #cd7f32 0%, #e6a86c 100%);
}

.bracket-container {
  position: relative;
  display: flex;
  gap: 40px;
  width: 100%;
  max-width: 1800px;
  overflow-x: auto;
  padding: 20px;
  align-items: stretch;
  margin: 0 auto;
}

.bracket-side {
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  gap: 16px;
  flex: 1;
  min-width: 0;
}

.right-bracket {
  flex-direction: row-reverse;
}

.round-section {
  flex: 0 0 132px;
  display: flex;
  flex-direction: column;
}

.round-section h3,
.diamond-row h2,
.diamond-row h3 {
  color: white;
  font-size: 16px;
  font-weight: 600;
  text-align: center;
  margin: 0 0 12px;
}

.matches {
  gap: 8px;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  flex: 1;
}

.center-diamond {
  flex: 0 0 200px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.diamond-row {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.semi-finals-row {
  display: flex;
  flex-direction: row;
  gap: 80px;
  justify-content: center;
  align-items: center;
}

.semi-final-left,
.semi-final-right {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.final-card :deep(.knockout-match-card) {
  border: 3px solid #ffd700;
  box-shadow: 0 4px 16px rgba(255, 215, 0, 0.3);
}

.center-connector-svg,
.connector-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: visible;
  z-index: 1;
}

.center-connector-svg {
  z-index: 0;
}

@media (max-width: 1200px) {
  .bracket-container {
    flex-direction: column;
    align-items: center;
  }

  .bracket-side,
  .right-bracket {
    flex-direction: column;
    align-items: stretch;
    width: 100%;
    max-width: 420px;
  }

  .round-section {
    flex: none;
  }

  .center-connector-svg,
  .connector-svg {
    display: none;
  }
}

@media (max-width: 760px) {
  .page-header {
    flex-direction: column;
  }

  .view-toggle {
    width: 100%;
  }

  .view-toggle :deep(.v-btn) {
    flex: 1;
  }

  h1 {
    font-size: 26px;
  }
}
</style>
