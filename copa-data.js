// COPA 2026 - copa-data.js - V12 ProData
// Base única complementar do app.
// Atualize este arquivo para placares locais, gols, cartões, posse, escalações e estatísticas avançadas.

window.COPA_DATA = {
  version: "V12 ProData",
  favorites: ["Brazil"],

  liveMatches: {
    "brazil|morocco": {
      hs: 1,
      as: 1,
      startISO: "2026-06-13T19:00:00-03:00",
      status: "finished",
      source: "COPA_DATA",
      possession: {home: 54, away: 46},
      stats: {
        shots: {home: null, away: null},
        shotsOnTarget: {home: null, away: null},
        corners: {home: null, away: null},
        fouls: {home: null, away: null},
        offsides: {home: null, away: null}
      },
      lineups: {
        home: [],
        away: []
      }
    }
  },

  events: [
    // México 2 x 0 África do Sul
    {match:"mexico|south africa", type:"red", team:"Mexico", player:"César Montes", minute:"90+", source:"TNT/Fox"},
    {match:"mexico|south africa", type:"red", team:"South Africa", player:"Sithole", minute:"?", source:"TNT/Fox"},
    {match:"mexico|south africa", type:"red", team:"South Africa", player:"Zwane", minute:"?", source:"TNT/Fox"},

    // EUA 4 x 1 Paraguai
    {match:"united states|paraguay", type:"yellow", team:"United States", player:"Tyler Adams", minute:"?", source:"Guardian"},
    {match:"united states|paraguay", type:"yellow", team:"Paraguay", player:"Miguel Almirón", minute:"?", source:"Guardian"},

    // Brasil 1 x 1 Marrocos
    {match:"brazil|morocco", type:"goal", team:"Morocco", player:"Ismael Saibari", minute:"21", source:"local"},
    {match:"brazil|morocco", type:"goal", team:"Brazil", player:"Vinícius Júnior", minute:"32", source:"local"},
    {match:"brazil|morocco", type:"yellow", team:"Brazil", player:"Casemiro", minute:"?", source:"local"},
    {match:"brazil|morocco", type:"yellow", team:"Brazil", player:"Roger Ibañez", minute:"?", source:"local"}
  ],

  // Totais por seleção quando a fonte informa o total, mas não todos os jogadores.
  disciplineTeamTotals: {
    "Paraguay": {yc:5, rc:0, source:"Axios"},
    "United States": {yc:1, rc:0, source:"Guardian"},
    "Mexico": {yc:0, rc:1, source:"TNT/Fox"},
    "South Africa": {yc:0, rc:2, source:"TNT/Fox"},
    "Brazil": {yc:2, rc:0, source:"local"}
  },

  teamProfiles: {
    "Brazil": {
      group: "C",
      notes: "Grupo C · acompanhar cartões de Casemiro e Roger Ibañez."
    }
  }
};
