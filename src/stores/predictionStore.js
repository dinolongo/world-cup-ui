import { defineStore } from 'pinia'

export const usePredictionStore = defineStore('prediction', {
  state: () => ({
    groups: {},
    selectedThirdPlaceTeams: [],
    roundOf32: []
  }),
  
  actions: {
    setGroups(groups) {
      this.groups = groups
    },
    
    setSelectedThirdPlaceTeams(teams) {
      this.selectedThirdPlaceTeams = teams
    },
    
    toggleThirdPlaceTeam(teamData) {
      const index = this.selectedThirdPlaceTeams.findIndex(
        t => t.team.teamName === teamData.team.teamName
      )
      if (index > -1) {
        this.selectedThirdPlaceTeams.splice(index, 1)
      } else if (this.selectedThirdPlaceTeams.length < 8) {
        this.selectedThirdPlaceTeams.push(teamData)
      }
    },
    
    isSelected(teamData) {
      return this.selectedThirdPlaceTeams.some(
        t => t.team.teamName === teamData.team.teamName
      )
    },
    
    reset() {
      this.groups = {}
      this.selectedThirdPlaceTeams = []
      this.roundOf32 = []
    }
  }
})
