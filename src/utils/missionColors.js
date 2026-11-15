/** Shared mission category colors for both planetary maps and their legends. */
export const MISSION_COLORS = Object.freeze({
  nasa: '#39ff14',
  isro: '#ff9933',
  operational: '#00d4ff',
});

export function getMissionColor(mission) {
  if (mission?.status === 'operational') return MISSION_COLORS.operational;
  return mission?.agency === 'ISRO' ? MISSION_COLORS.isro : MISSION_COLORS.nasa;
}
