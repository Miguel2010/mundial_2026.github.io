const TEAM_COUNTRY_CODES: Record<string, string> = {
  Alemania: 'DE',
  Arabia_Saudí: 'SA',
  Argelia: 'DZ',
  Argentina: 'AR',
  Australia: 'AU',
  Austria: 'AT',
  Bélgica: 'BE',
  Bosnia_y_Herzegovina: 'BA',
  Brasil: 'BR',
  Cabo_Verde: 'CV',
  Canadá: 'CA',
  Catar: 'QA',
  Chequia: 'CZ',
  Colombia: 'CO',
  Corea_del_Sur: 'KR',
  Costa_de_Marfil: 'CI',
  Croacia: 'HR',
  Curazao: 'CW',
  Ecuador: 'EC',
  Egipto: 'EG',
  Escocia: 'GB-SCT',
  España: 'ES',
  Estados_Unidos: 'US',
  Francia: 'FR',
  Ghana: 'GH',
  Haití: 'HT',
  Inglaterra: 'GB-ENG',
  Irak: 'IQ',
  Irán: 'IR',
  Japón: 'JP',
  Jordania: 'JO',
  Marruecos: 'MA',
  México: 'MX',
  Noruega: 'NO',
  Nueva_Zelanda: 'NZ',
  Países_Bajos: 'NL',
  Panamá: 'PA',
  Paraguay: 'PY',
  Portugal: 'PT',
  RD_Congo: 'CD',
  Senegal: 'SN',
  Sudáfrica: 'ZA',
  Suecia: 'SE',
  Suiza: 'CH',
  Túnez: 'TN',
  Turquía: 'TR',
  Uruguay: 'UY',
  Uzbekistán: 'UZ',
};

const SUBDIVISION_FLAGS: Record<string, string> = {
  'GB-ENG': '\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}',
  'GB-SCT': '\u{1F3F4}\u{E0067}\u{E0062}\u{E0073}\u{E0063}\u{E0074}\u{E007F}',
};

function countryCodeToFlag(countryCode: string) {
  const subdivisionFlag = SUBDIVISION_FLAGS[countryCode];

  if (subdivisionFlag) {
    return subdivisionFlag;
  }

  return countryCode
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}

export function formatTeamName(teamName: string) {
  return teamName.replace(/_/g, ' ');
}

export function getTeamFlag(teamName: string) {
  const countryCode = TEAM_COUNTRY_CODES[teamName];

  return countryCode ? countryCodeToFlag(countryCode) : '';
}
