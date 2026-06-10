<script setup>
import { ref, onMounted, computed } from 'vue'
import matchStadiumData from '../data/match-stadium.json'
import stadiumData from '../data/stadium-data.json'
import { usePredictionStore } from '../stores/predictionStore'

const predictionStore = usePredictionStore()

// Team crest mapping
const teamCrests = {
  'Uruguay': 'https://crests.football-data.org/758.svg',
  'Germany': 'https://crests.football-data.org/759.svg',
  'Spain': 'https://crests.football-data.org/760.svg',
  'Paraguay': 'https://crests.football-data.org/761.svg',
  'Argentina': 'https://crests.football-data.org/762.png',
  'Ghana': 'https://crests.football-data.org/ghana.svg',
  'Brazil': 'https://crests.football-data.org/764.svg',
  'Portugal': 'https://crests.football-data.org/765.svg',
  'Japan': 'https://crests.football-data.org/766.svg',
  'Mexico': 'https://crests.football-data.org/769.svg',
  'England': 'https://crests.football-data.org/770.svg',
  'United States': 'https://crests.football-data.org/usa.svg',
  'South Korea': 'https://crests.football-data.org/772.png',
  'France': 'https://crests.football-data.org/773.svg',
  'South Africa': 'https://crests.football-data.org/9396.svg',
  'Canada': 'https://crests.football-data.org/canada.svg',
  'Qatar': 'https://crests.football-data.org/8030.svg',
  'Switzerland': 'https://crests.football-data.org/788.svg',
  'Morocco': 'https://crests.football-data.org/morocco.svg',
  'Australia': 'https://crests.football-data.org/779.svg',
  'Netherlands': 'https://crests.football-data.org/8601.svg',
  'Sweden': 'https://crests.football-data.org/792.svg',
  'Belgium': 'https://crests.football-data.org/805.svg',
  'Egypt': 'https://crests.football-data.org/825.svg',
  'Iran': 'https://crests.football-data.org/iran.svg',
  'New Zealand': 'https://crests.football-data.org/783.svg',
  'Cape Verde Islands': 'https://crests.football-data.org/cape_verde.svg',
  'Saudi Arabia': 'https://crests.football-data.org/saudi_arabia.svg',
  'Senegal': 'https://crests.football-data.org/senegal.svg',
  'Iraq': 'https://crests.football-data.org/iraq.svg',
  'Norway': 'https://crests.football-data.org/813.svg',
  'Algeria': 'https://crests.football-data.org/algeria.svg',
  'Austria': 'https://crests.football-data.org/816.svg',
  'Jordan': 'https://crests.football-data.org/8049.png',
  'Uzbekistan': 'https://crests.football-data.org/8070.png',
  'Colombia': 'https://crests.football-data.org/818.svg',
  'Congo DR': 'https://crests.football-data.org/congo_dr.svg',
  'Croatia': 'https://crests.football-data.org/799.svg',
  'Panama': 'https://crests.football-data.org/panama.svg',
  'Czechia': 'https://crests.football-data.org/798.svg',
  'Bosnia-Herzegovina': 'https://crests.football-data.org/bosnia.svg',
  'Haiti': 'https://crests.football-data.org/haiti.svg',
  'Scotland': 'https://crests.football-data.org/814.svg',
  'Wales': 'https://crests.football-data.org/793.svg',
  'Finland': 'https://crests.football-data.org/810.svg',
  'Denmark': 'https://crests.football-data.org/801.svg',
  'Slovenia': 'https://crests.football-data.org/811.svg',
  'Slovakia': 'https://crests.football-data.org/812.svg',
  'Turkey': 'https://crests.football-data.org/802.svg',
  'Greece': 'https://crests.football-data.org/804.svg',
  'Serbia': 'https://crests.football-data.org/806.svg',
  'Italy': 'https://crests.football-data.org/807.svg',
  'Poland': 'https://crests.football-data.org/808.svg',
  'Ukraine': 'https://crests.football-data.org/809.svg',
  'Russia': 'https://crests.football-data.org/815.svg',
  'Tunisia': 'https://crests.football-data.org/tunisia.svg',
  'Nigeria': 'https://crests.football-data.org/nigeria.svg',
  'Ivory Coast': 'https://crests.football-data.org/ivory_coast.svg',
  'Cameroon': 'https://crests.football-data.org/cameroon.svg',
  'Mali': 'https://crests.football-data.org/mali.svg',
  'Costa Rica': 'https://crests.football-data.org/costa_rica.svg',
  'Jamaica': 'https://crests.football-data.org/jamaica.svg',
  'Honduras': 'https://crests.football-data.org/honduras.svg',
  'Trinidad and Tobago': 'https://crests.football-data.org/trinidad.svg',
  'Chile': 'https://crests.football-data.org/chile.svg',
  'Ecuador': 'https://crests.football-data.org/ecuador.svg',
  'Peru': 'https://crests.football-data.org/peru.svg',
  'Bolivia': 'https://crests.football-data.org/bolivia.svg',
  'Venezuela': 'https://crests.football-data.org/venezuela.svg',
  'China': 'https://crests.football-data.org/china.svg',
  'India': 'https://crests.football-data.org/india.svg',
  'Thailand': 'https://crests.football-data.org/thailand.svg',
  'Vietnam': 'https://crests.football-data.org/vietnam.svg',
  'Indonesia': 'https://crests.football-data.org/indonesia.svg',
  'Malaysia': 'https://crests.football-data.org/malaysia.svg',
  'Philippines': 'https://crests.football-data.org/philippines.svg',
  'North Korea': 'https://crests.football-data.org/north_korea.svg',
  'Syria': 'https://crests.football-data.org/syria.svg',
  'Lebanon': 'https://crests.football-data.org/lebanon.svg',
  'Oman': 'https://crests.football-data.org/oman.svg',
  'United Arab Emirates': 'https://crests.football-data.org/uae.svg',
  'Kuwait': 'https://crests.football-data.org/kuwait.svg',
  'Bahrain': 'https://crests.football-data.org/bahrain.svg',
  'Yemen': 'https://crests.football-data.org/yemen.svg',
  'Palestine': 'https://crests.football-data.org/palestine.svg',
  'Libya': 'https://crests.football-data.org/libya.svg',
  'Angola': 'https://crests.football-data.org/angola.svg',
  'Zimbabwe': 'https://crests.football-data.org/zimbabwe.svg',
  'Zambia': 'https://crests.football-data.org/zambia.svg',
  'Kenya': 'https://crests.football-data.org/kenya.svg',
  'Ethiopia': 'https://crests.football-data.org/ethiopia.svg',
  'Uganda': 'https://crests.football-data.org/uganda.svg',
  'Tanzania': 'https://crests.football-data.org/tanzania.svg',
  'Sudan': 'https://crests.football-data.org/sudan.svg',
  'Gabon': 'https://crests.football-data.org/gabon.svg',
  'Guinea': 'https://crests.football-data.org/guinea.svg',
  'Burkina Faso': 'https://crests.football-data.org/burkina_faso.svg',
  'Niger': 'https://crests.football-data.org/niger.svg',
  'Mauritania': 'https://crests.football-data.org/mauritania.svg',
  'Madagascar': 'https://crests.football-data.org/madagascar.svg',
  'Benin': 'https://crests.football-data.org/benin.svg',
  'Togo': 'https://crests.football-data.org/togo.svg',
  'Central African Republic': 'https://crests.football-data.org/car.svg',
  'Equatorial Guinea': 'https://crests.football-data.org/equatorial_guinea.svg',
  'Guinea-Bissau': 'https://crests.football-data.org/guinea_bissau.svg',
  'Liberia': 'https://crests.football-data.org/liberia.svg',
  'Sierra Leone': 'https://crests.football-data.org/sierra_leone.svg',
  'Gambia': 'https://crests.football-data.org/gambia.svg',
  'Comoros': 'https://crests.football-data.org/comoros.svg',
  'Djibouti': 'https://crests.football-data.org/djibouti.svg',
  'Eritrea': 'https://crests.football-data.org/eritrea.svg',
  'Somalia': 'https://crests.football-data.org/somalia.svg',
  'Mozambique': 'https://crests.football-data.org/mozambique.svg',
  'Malawi': 'https://crests.football-data.org/malawi.svg',
  'Botswana': 'https://crests.football-data.org/botswana.svg',
  'Namibia': 'https://crests.football-data.org/namibia.svg',
  'Lesotho': 'https://crests.football-data.org/lesotho.svg',
  'Eswatini': 'https://crests.football-data.org/eswatini.svg',
  'Rwanda': 'https://crests.football-data.org/rwanda.svg',
  'Burundi': 'https://crests.football-data.org/burundi.svg',
  'Congo': 'https://crests.football-data.org/congo.svg',
  'Chad': 'https://crests.football-data.org/chad.svg'
}

// Reactive state
const knockoutMatches = ref([])
const stadiums = ref([])
const loading = ref(true)

// Get third-place seeding lookup
const thirdPlaceSeeding = computed(() => predictionStore.getThirdPlaceSeeding())

// Load data
onMounted(() => {
  // Filter for knockout stage matches only
  knockoutMatches.value = matchStadiumData.matches.filter(match => 
    match.round === 'Round of 32' || 
    match.round === 'Round of 16' || 
    match.round === 'Quarter-final' || 
    match.round === 'Semi-final' || 
    match.round === 'Match for third place' || 
    match.round === 'Final'
  )
  
  stadiums.value = stadiumData.stadiums
  loading.value = false
})

// Get stadium details by name
const getStadium = (groundName) => {
  return stadiums.value.find(stadium => stadium.name === groundName) || null
}

// Format date for display
const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// Format time for display
const formatTime = (timeStr) => {
  return timeStr
}

// Get team name from code, using predictions if available
const getTeamName = (teamCode, matchNum, opponentCode) => {
  if (!teamCode) return 'TBD'
  
  // Handle winner references (W74, W77, etc.)
  if (teamCode.startsWith('W')) {
    const sourceMatchNum = teamCode.substring(1)
    // Check if we have a prediction for this match
    if (knockoutPredictions.value[sourceMatchNum]) {
      return knockoutPredictions.value[sourceMatchNum]
    }
    return `Winner of Match ${sourceMatchNum}`
  }
  
  // Handle loser references (L101, L102, etc.)
  if (teamCode.startsWith('L')) {
    const matchNum = teamCode.substring(1)
    return `Loser of Match ${matchNum}`
  }
  
  // Handle 3rd place team codes with multiple groups (3A/B/C/D/F, etc.)
  if (teamCode.includes('/')) {
    // Use seeding lookup to determine which third-place team plays here
    if (thirdPlaceSeeding.value && opponentCode) {
      // The opponent code (e.g., "1E") tells us which position this match is for
      // Look up which third-place team code is assigned to this position
      const thirdPlaceCode = thirdPlaceSeeding.value[opponentCode]
      if (thirdPlaceCode) {
        const teamName = predictionStore.getTeamFromCode(thirdPlaceCode)
        if (teamName) return teamName
      }
    }
    return 'Best 3rd Place Team'
  }
  
  // Try to get predicted team from store
  const predictedTeam = predictionStore.getTeamFromCode(teamCode)
  if (predictedTeam) return predictedTeam
  
  // Fallback to formatted placeholder
  return formatTeamNamePlaceholder(teamCode)
}

// Format team name placeholder when no prediction available
const formatTeamNamePlaceholder = (teamCode) => {
  // Handle group position codes (1A, 2B, 3C, etc.)
  const groupMatch = teamCode.match(/^(\d)([A-L])$/)
  if (groupMatch) {
    const position = groupMatch[1]
    const group = groupMatch[2]
    const positionText = position === '1' ? 'Winner' : position === '2' ? 'Runner-up' : '3rd Place'
    return `${positionText} of Group ${group}`
  }
  
  return teamCode
}

// Get team crest URL
const getTeamCrest = (teamName) => {
  return teamCrests[teamName] || null
}

// Store for knockout predictions
const knockoutPredictions = ref({})

// Handle team selection with auto-advance
const selectWinner = (match, team) => {
  // Store the winner for this match
  knockoutPredictions.value[match.num] = team
  
  // Load bracket advancement data
  import('../data/bracket-advancement.json').then(data => {
    const advancement = data.default || data
    
    // Find which matches this winner advances to
    const advancesTo = advancement.forward[match.num]
    if (advancesTo) {
      // Update the team in the advancing match
      const advancingMatch = knockoutMatches.value.find(m => m.num === advancesTo.matchNum)
      if (advancingMatch) {
        if (advancesTo.position === 'team1') {
          advancingMatch.team1 = `W${match.num}`
        } else if (advancesTo.position === 'team2') {
          advancingMatch.team2 = `W${match.num}`
        }
      }
    }
  })
}
</script>

<template>
  <div class="knockouts-page">
    <h1>World Cup 2026 - Knockout Stage</h1>
    
    <div v-if="loading" class="loading">
      Loading bracket...
    </div>
    
    <div v-else class="bracket-container">
      <!-- Round of 32 -->
      <div class="round">
        <h2>Round of 32</h2>
        <div class="matches">
          <div 
            v-for="match in knockoutMatches.filter(m => m.round === 'Round of 32')" 
            :key="match.num"
            class="match-card"
          >
            <div class="match-info">
              <span class="date-time">{{ formatDate(match.date) }} • {{ formatTime(match.time) }}</span>
              <span class="stadium">{{ getStadium(match.ground)?.name || match.ground }}</span>
              <span class="city">{{ getStadium(match.ground)?.city || '' }}</span>
            </div>
            <div class="teams">
              <button 
                class="team-button"
                @click="selectWinner(match, getTeamName(match.team1, match.num, match.team2))"
              >
                <img 
                  v-if="getTeamCrest(getTeamName(match.team1, match.num, match.team2))" 
                  :src="getTeamCrest(getTeamName(match.team1, match.num, match.team2))" 
                  class="team-flag"
                  alt=""
                />
                {{ getTeamName(match.team1, match.num, match.team2) }}
              </button>
              <button 
                class="team-button"
                @click="selectWinner(match, getTeamName(match.team2, match.num, match.team1))"
              >
                <img 
                  v-if="getTeamCrest(getTeamName(match.team2, match.num, match.team1))" 
                  :src="getTeamCrest(getTeamName(match.team2, match.num, match.team1))" 
                  class="team-flag"
                  alt=""
                />
                {{ getTeamName(match.team2, match.num, match.team1) }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Round of 16 -->
      <div class="round">
        <h2>Round of 16</h2>
        <div class="matches">
          <div 
            v-for="match in knockoutMatches.filter(m => m.round === 'Round of 16')" 
            :key="match.num"
            class="match-card"
          >
            <div class="match-info">
              <span class="date-time">{{ formatDate(match.date) }} • {{ formatTime(match.time) }}</span>
              <span class="stadium">{{ getStadium(match.ground)?.name || match.ground }}</span>
              <span class="city">{{ getStadium(match.ground)?.city || '' }}</span>
            </div>
            <div class="teams">
              <button 
                class="team-button"
                @click="selectWinner(match, getTeamName(match.team1, match.num, match.team2))"
              >
                <img 
                  v-if="getTeamCrest(getTeamName(match.team1, match.num, match.team2))" 
                  :src="getTeamCrest(getTeamName(match.team1, match.num, match.team2))" 
                  class="team-flag"
                  alt=""
                />
                {{ getTeamName(match.team1, match.num, match.team2) }}
              </button>
              <button 
                class="team-button"
                @click="selectWinner(match, getTeamName(match.team2, match.num, match.team1))"
              >
                <img 
                  v-if="getTeamCrest(getTeamName(match.team2, match.num, match.team1))" 
                  :src="getTeamCrest(getTeamName(match.team2, match.num, match.team1))" 
                  class="team-flag"
                  alt=""
                />
                {{ getTeamName(match.team2, match.num, match.team1) }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Quarter Finals -->
      <div class="round">
        <h2>Quarter Finals</h2>
        <div class="matches">
          <div 
            v-for="match in knockoutMatches.filter(m => m.round === 'Quarter-final')" 
            :key="match.num"
            class="match-card"
          >
            <div class="match-info">
              <span class="date-time">{{ formatDate(match.date) }} • {{ formatTime(match.time) }}</span>
              <span class="stadium">{{ getStadium(match.ground)?.name || match.ground }}</span>
              <span class="city">{{ getStadium(match.ground)?.city || '' }}</span>
            </div>
            <div class="teams">
              <button 
                class="team-button"
                @click="selectWinner(match, getTeamName(match.team1, match.num, match.team2))"
              >
                <img 
                  v-if="getTeamCrest(getTeamName(match.team1, match.num, match.team2))" 
                  :src="getTeamCrest(getTeamName(match.team1, match.num, match.team2))" 
                  class="team-flag"
                  alt=""
                />
                {{ getTeamName(match.team1, match.num, match.team2) }}
              </button>
              <button 
                class="team-button"
                @click="selectWinner(match, getTeamName(match.team2, match.num, match.team1))"
              >
                <img 
                  v-if="getTeamCrest(getTeamName(match.team2, match.num, match.team1))" 
                  :src="getTeamCrest(getTeamName(match.team2, match.num, match.team1))" 
                  class="team-flag"
                  alt=""
                />
                {{ getTeamName(match.team2, match.num, match.team1) }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Semi Finals -->
      <div class="round">
        <h2>Semi Finals</h2>
        <div class="matches">
          <div 
            v-for="match in knockoutMatches.filter(m => m.round === 'Semi-final')" 
            :key="match.num"
            class="match-card"
          >
            <div class="match-info">
              <span class="date-time">{{ formatDate(match.date) }} • {{ formatTime(match.time) }}</span>
              <span class="stadium">{{ getStadium(match.ground)?.name || match.ground }}</span>
              <span class="city">{{ getStadium(match.ground)?.city || '' }}</span>
            </div>
            <div class="teams">
              <button 
                class="team-button"
                @click="selectWinner(match, getTeamName(match.team1, match.num, match.team2))"
              >
                <img 
                  v-if="getTeamCrest(getTeamName(match.team1, match.num, match.team2))" 
                  :src="getTeamCrest(getTeamName(match.team1, match.num, match.team2))" 
                  class="team-flag"
                  alt=""
                />
                {{ getTeamName(match.team1, match.num, match.team2) }}
              </button>
              <button 
                class="team-button"
                @click="selectWinner(match, getTeamName(match.team2, match.num, match.team1))"
              >
                <img 
                  v-if="getTeamCrest(getTeamName(match.team2, match.num, match.team1))" 
                  :src="getTeamCrest(getTeamName(match.team2, match.num, match.team1))" 
                  class="team-flag"
                  alt=""
                />
                {{ getTeamName(match.team2, match.num, match.team1) }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Third Place Match -->
      <div class="round">
        <h2>Third Place Match</h2>
        <div class="matches">
          <div 
            v-for="match in knockoutMatches.filter(m => m.round === 'Match for third place')" 
            :key="match.num"
            class="match-card"
          >
            <div class="match-info">
              <span class="date-time">{{ formatDate(match.date) }} • {{ formatTime(match.time) }}</span>
              <span class="stadium">{{ getStadium(match.ground)?.name || match.ground }}</span>
              <span class="city">{{ getStadium(match.ground)?.city || '' }}</span>
            </div>
            <div class="teams">
              <button 
                class="team-button"
                @click="selectWinner(match, getTeamName(match.team1, match.num, match.team2))"
              >
                <img 
                  v-if="getTeamCrest(getTeamName(match.team1, match.num, match.team2))" 
                  :src="getTeamCrest(getTeamName(match.team1, match.num, match.team2))" 
                  class="team-flag"
                  alt=""
                />
                {{ getTeamName(match.team1, match.num, match.team2) }}
              </button>
              <button 
                class="team-button"
                @click="selectWinner(match, getTeamName(match.team2, match.num, match.team1))"
              >
                <img 
                  v-if="getTeamCrest(getTeamName(match.team2, match.num, match.team1))" 
                  :src="getTeamCrest(getTeamName(match.team2, match.num, match.team1))" 
                  class="team-flag"
                  alt=""
                />
                {{ getTeamName(match.team2, match.num, match.team1) }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Final -->
      <div class="round final">
        <h2>Final</h2>
        <div class="matches">
          <div 
            v-for="match in knockoutMatches.filter(m => m.round === 'Final')" 
            :key="match.num"
            class="match-card final-card"
          >
            <div class="match-info">
              <span class="date-time">{{ formatDate(match.date) }} • {{ formatTime(match.time) }}</span>
              <span class="stadium">{{ getStadium(match.ground)?.name || match.ground }}</span>
              <span class="city">{{ getStadium(match.ground)?.city || '' }}</span>
            </div>
            <div class="teams">
              <button 
                class="team-button"
                @click="selectWinner(match, getTeamName(match.team1, match.num, match.team2))"
              >
                <img 
                  v-if="getTeamCrest(getTeamName(match.team1, match.num, match.team2))" 
                  :src="getTeamCrest(getTeamName(match.team1, match.num, match.team2))" 
                  class="team-flag"
                  alt=""
                />
                {{ getTeamName(match.team1, match.num, match.team2) }}
              </button>
              <button 
                class="team-button"
                @click="selectWinner(match, getTeamName(match.team2, match.num, match.team1))"
              >
                <img 
                  v-if="getTeamCrest(getTeamName(match.team2, match.num, match.team1))" 
                  :src="getTeamCrest(getTeamName(match.team2, match.num, match.team1))" 
                  class="team-flag"
                  alt=""
                />
                {{ getTeamName(match.team2, match.num, match.team1) }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.knockouts-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

h1 {
  color: white;
  font-size: 32px;
  font-weight: 700;
  text-align: center;
  margin: 0 0 40px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.loading {
  color: white;
  font-size: 18px;
}

.bracket-container {
  display: flex;
  gap: 40px;
  width: 100%;
  max-width: 1600px;
  overflow-x: auto;
  padding: 20px;
}

.round {
  flex: 1;
  min-width: 200px;
}

.round h2 {
  color: white;
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 20px;
}

.matches {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.match-card {
  background: white;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.match-card.final-card {
  border: 3px solid #ffd700;
  box-shadow: 0 4px 16px rgba(255, 215, 0, 0.3);
}

.match-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;
  font-size: 12px;
  color: #666;
}

.date-time {
  font-weight: 600;
  color: #333;
}

.stadium {
  color: #666;
  font-weight: 500;
}

.city {
  color: #999;
  font-size: 11px;
}

.teams {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.team-button {
  background: #f5f5f5;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 500;
  color: #333;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.team-button:hover {
  background: #e8f4e8;
  border-color: #4caf50;
  color: #2e7d32;
}

.team-button:active {
  transform: scale(0.98);
}

.final .team-button:hover {
  background: #fff8e1;
  border-color: #ffc107;
  color: #f57c00;
}

@media (max-width: 1024px) {
  .bracket-container {
    flex-direction: column;
    align-items: center;
  }
  
  .round {
    width: 100%;
    max-width: 400px;
  }
}
</style>
