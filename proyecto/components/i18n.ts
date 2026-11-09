// Idioma de los textos en pantalla. Episode fija el idioma antes de renderizar las escenas;
// L('texto en español') devuelve la traducción si el idioma activo es inglés.
let LANG: 'es' | 'en' = 'es';
export const setLang = (l: 'es' | 'en') => { LANG = l; };
export const getLang = () => LANG;
export const L = (s: string): string => (LANG === 'en' ? EN[s] ?? s : s);
export const fmtNum = (v: number, decimals = 0) => v.toLocaleString(LANG === 'en' ? 'en-US' : 'es-ES', {minimumFractionDigits: decimals, maximumFractionDigits: decimals});

export const EN: Record<string, string> = {
  // --- serie
  '¿Y SI…?': 'WHAT IF…?', 'ESCENARIO HIPOTÉTICO': 'HYPOTHETICAL SCENARIO', 'SÍGUEME PARA MÁS ¿Y SI…?': 'FOLLOW FOR MORE WHAT IF…?',
  '¿Y SI…? HISTORIA': 'WHAT IF…? HISTORY', 'Historia alternativa en 1 minuto': 'Alternate history in 1 minute', 'SUSCRITO ✓': 'SUBSCRIBED ✓', 'SUSCRÍBETE': 'SUBSCRIBE',
  // --- URSS
  '25·12·1991': 'DEC 25, 1991', 'MOSCÚ, KREMLIN': 'MOSCOW, KREMLIN', 'repúblicas': 'republics', 'la sexta parte de la tierra firme': 'one sixth of the world’s land',
  'de habitantes (aprox.)': 'people (approx.)', 'ECONOMÍA': 'ECONOMY', 'PETRÓLEO': 'OIL', 'AFGANISTÁN': 'AFGHANISTAN', 'VACÍO': 'EMPTY',
  'Mijaíl Gorbachov': 'Mikhail Gorbachev', 'Secretario General del PCUS (1985–1991)': 'General Secretary of the CPSU (1985–1991)',
  'PERESTROIKA · reestructuración': 'PERESTROIKA · restructuring', 'GLÁSNOST · transparencia': 'GLASNOST · openness', 'URSS': 'USSR',
  '9·11·1989': 'NOV 9, 1989', 'BERLÍN': 'BERLIN', '19–21 AGO 1991': 'AUG 19–21, 1991', 'MOSCÚ': 'MOSCOW', 'Borís Yeltsin': 'Boris Yeltsin',
  'Presidente de Rusia (RSFS)': 'President of Russia (RSFSR)', '3 DÍAS': '3 DAYS', 'MERCADO': 'FREE MARKETS', 'MANO DE HIERRO': 'IRON FIST',
  'TELÓN DE ACERO': 'IRON CURTAIN', '15·11·1988': 'NOV 15, 1988', 'BAIKONUR · ÚNICO VUELO': 'BAIKONUR · ONLY FLIGHT', 'Moscú': 'Moscow',
  'ESTONIA': 'ESTONIA', 'LETONIA': 'LATVIA', 'LITUANIA': 'LITHUANIA', 'RSS DE UCRANIA': 'UKRAINIAN SSR', 'OTAN': 'NATO',
  'POLONIA': 'POLAND', 'R. D. ALEMANA': 'EAST GERMANY', 'HUNGRÍA': 'HUNGARY', 'CHECOSLOVAQUIA': 'CZECHOSLOVAKIA', 'BULGARIA': 'BULGARIA', 'RUMANÍA': 'ROMANIA',
  // --- Napoleón
  '18·06·1815': 'JUNE 18, 1815', 'WATERLOO (ACTUAL BÉLGICA)': 'WATERLOO (PRESENT-DAY BELGIUM)', '2·12·1804': 'DEC 2, 1804', 'NOTRE-DAME, PARÍS': 'NOTRE-DAME, PARIS',
  '2·12·1805': 'DEC 2, 1805', 'EUROPA (FRONTERAS APROXIMADAS)': 'EUROPE (APPROXIMATE BORDERS)', 'JUNIO 1812': 'JUNE 1812', 'INVASIÓN DE RUSIA': 'INVASION OF RUSSIA',
  'Mijaíl Kutúzov': 'Mikhail Kutuzov', 'Comandante en jefe ruso': 'Russian commander-in-chief', 'HASTA -30 °C': 'DOWN TO -30 °C (-22 °F)',
  'HUIDA DE ELBA': 'ESCAPE FROM ELBA', 'Ejército anglo-aliado': 'Anglo-allied army', 'Ejército prusiano': 'Prussian army',
  'BARRO · ATAQUE RETRASADO': 'MUD · ATTACK DELAYED', '¡VICTORIA FRANCESA!': 'FRENCH VICTORY!', '¡SORPRESA!': 'PLOT TWIST!',
  'soldados de la coalición (aprox.)': 'coalition soldiers (approx.)', 'CÓDIGO NAPOLEÓNICO': 'NAPOLEONIC CODE', 'SISTEMA MÉTRICO': 'METRIC SYSTEM',
  '¿UE EN 1812?': 'AN EU IN 1812?', '5·5·1821': 'MAY 5, 1821', 'SANTA ELENA': 'SAINT HELENA', '☀ SUELO SECO · PRUSIANOS LEJOS': '☀ DRY GROUND · PRUSSIANS FAR AWAY',
  'IMPERIO FRANCÉS': 'FRENCH EMPIRE', 'ESTADOS SATÉLITE': 'SATELLITE STATES', 'Y ALIADOS FORZOSOS': 'AND FORCED ALLIES', 'Varsovia': 'Warsaw', 'París': 'Paris',
  'IMPERIO RUSO': 'RUSSIAN EMPIRE', 'AUSTRIA': 'AUSTRIA', 'RUSIA': 'RUSSIA', 'FRANCIA': 'FRANCE', 'IMPERIO NAPOLEÓNICO': 'NAPOLEONIC EMPIRE', 'HIPOTÉTICO': 'HYPOTHETICAL',
  // --- Taiwán
  'en su punto más estrecho': 'at its narrowest point', 'NO DESCARTA LA FUERZA': 'DOES NOT RULE OUT FORCE', 'de los chips más avanzados': 'of the most advanced chips',
  'BLOQUEO': 'BLOCKADE', 'COMERCIO DETENIDO': 'TRADE HALTED', 'MONTAÑAS': 'MOUNTAINS', 'POCAS PLAYAS': 'FEW BEACHES', 'VENTANAS: ABRIL Y OCTUBRE': 'WINDOWS: APRIL AND OCTOBER',
  'Almirante (ficticio)': 'Admiral (fictional)', 'Armada de EE. UU.': 'U.S. Navy', 'PIB MUNDIAL': 'GLOBAL GDP',
  'EL GOBIERNO NACIONALISTA SE RETIRA A TAIWÁN': 'THE NATIONALIST GOVERNMENT RETREATS TO TAIWAN', 'PEKÍN': 'BEIJING', 'TAIPÉI': 'TAIPEI', 'IA': 'AI',
  'NORMANDÍA 1944 · LA REFERENCIA': 'NORMANDY 1944 · THE BENCHMARK', 'CSIS · ENERO 2023 · 24 SIMULACIONES': 'CSIS · JANUARY 2023 · 24 SIMULATIONS',
  'MENOR': 'SMALLER', 'Impacto estimado en el PIB mundial · Bloomberg Economics (2024)': 'Estimated impact on global GDP · Bloomberg Economics (2024)',
  'Barras grises: comparación ilustrativa': 'Grey bars: illustrative comparison', 'DECENAS': 'DOZENS', 'de buques': 'of ships', 'CIENTOS': 'HUNDREDS',
  'de aviones': 'of aircraft', 'MILES': 'THOUSANDS', 'de bajas': 'of casualties', 'FRACASA': 'FAILS', 'INCIERTO': 'UNCLEAR', 'TAIWÁN': 'TAIWAN',
  'Crisis 2008': '2008 crisis', 'Pandemia 2020': '2020 pandemic', 'Guerra por Taiwán': 'War over Taiwan',
  // --- España
  'REAL DE A 8 · LA MONEDA GLOBAL': 'PIECE OF EIGHT · THE GLOBAL COIN', 'Conde de Aranda': 'Count of Aranda', 'Diplomático de Carlos III': 'Diplomat of Charles III',
  'CORTE DE CARLOS III': 'COURT OF CHARLES III', 'MAYO 1808': 'MAY 1808', 'BAYONA (FRANCIA)': 'BAYONNE (FRANCE)', 'Rey de España': 'King of Spain',
  'Fernando VII': 'Ferdinand VII', 'El Libertador': 'The Liberator', 'Libertador del Sur': 'Liberator of the South', '9·12·1824': 'DEC 9, 1824', 'AYACUCHO (PERÚ)': 'AYACUCHO (PERU)',
  'COMUNIDAD HISPÁNICA': 'HISPANIC COMMONWEALTH', 'hispanoamérica (países actuales)': 'Spanish America (present-day countries)',
  'personas (España + Hispanoamérica, hoy)': 'people (Spain + Spanish America, today)', 'AUTENTICIDAD DISCUTIDA': 'AUTHENTICITY DISPUTED',
  'IMPERIO ESPAÑOL': 'SPANISH EMPIRE', 'HACIA 1790 · FRONTERAS APROX.': 'C. 1790 · APPROX. BORDERS', 'NUEVA ESPAÑA': 'NEW SPAIN', 'PERÚ': 'PERU',
  'N. GRANADA': 'N. GRANADA', 'RÍO DE LA PLATA': 'RÍO DE LA PLATA', 'FLOTA DE INDIAS': 'SPANISH TREASURE FLEET', '→ MANILA': '→ MANILA',
  'MÉXICO': 'MEXICO', 'COSTA FIRME': 'TIERRA FIRME', 'ESPAÑA': 'SPAIN', 'CUBA Y PUERTO RICO': 'CUBA AND PUERTO RICO', 'CUBA': 'CUBA', 'PUERTO RICO': 'PUERTO RICO',
  'Cádiz': 'Cádiz', 'Potosí': 'Potosí', '¿California?': 'California?', '¿Texas?': 'Texas?', 'MADRID': 'MADRID',
  // --- Segunda Guerra Mundial
  'VIENA, 1907': 'VIENNA, 1907', 'EXAMEN DE INGRESO': 'ENTRANCE EXAM', 'Aspirante a pintor, 18 años': 'Aspiring painter, age 18',
  '1939 – 1945': '1939 – 1945', 'SEGUNDA GUERRA MUNDIAL': 'WORLD WAR II', 'de muertos (estimación)': 'dead (estimate)', 'de la población mundial de 1940': 'of the world population in 1940',
  'VERSALLES 1919': 'VERSAILLES 1919', 'CRISIS DE 1929': 'CRASH OF 1929', 'JAPÓN E ITALIA': 'JAPAN AND ITALY', 'NO FUE COSA DE UN SOLO HOMBRE': 'IT WASN’T JUST ONE MAN',
  '30·09·1938': 'SEPT 30, 1938', 'ACUERDOS DE MÚNICH': 'MUNICH AGREEMENT', 'Primer ministro británico': 'British Prime Minister', '«PAZ PARA NUESTRO TIEMPO»': '“PEACE FOR OUR TIME”',
  'RADAR': 'RADAR', 'REACTORES': 'JET ENGINES', 'ORDENADORES': 'COMPUTERS', 'PENICILINA': 'PENICILLIN', 'LLEGARÍAN MÁS TARDE': 'THEY WOULD COME LATER',
  '¿NINGUNA BOMBA ATÓMICA EN GUERRA?': 'NO ATOMIC BOMB IN WAR?', 'Defensor del Imperio británico': 'Defender of the British Empire',
  'Líder de la independencia india': 'Leader of Indian independence', 'Iósif Stalin': 'Joseph Stalin', 'Líder de la URSS (1924–1953)': 'Leader of the USSR (1924–1953)',
  'SIN GUERRA FRÍA': 'NO COLD WAR', '¿SIN ONU?': 'NO UN?', 'VÍCTIMAS JUDÍAS DEL HOLOCAUSTO': 'JEWISH VICTIMS OF THE HOLOCAUST', '¿ADMITIDO?': 'ACCEPTED?',
  'NO ADMITIDO': 'REJECTED', '≈ 600.000': '≈ 600,000', '6.000.000': '6,000,000', 'IMPERIO BRITÁNICO': 'BRITISH EMPIRE', 'Berlín': 'Berlin',
};
