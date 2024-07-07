export function millisecondsToNextDivisibleSecond(divisor: number, reference: Date = new Date()) {
  const currentMilliseconds = reference.getMilliseconds();
  const currentSeconds = reference.getSeconds();

  // Finde die nächste teilbare Sekunde
  const nextDivisibleSecond = Math.ceil((currentSeconds + 1) / divisor) * divisor;

  // Berechne die verbleibende Zeit bis zur nächsten teilbaren Sekunde in Millisekunden
  const millisecondsToNextSecond = (nextDivisibleSecond - currentSeconds) * 1000;
  const remainingMilliseconds = millisecondsToNextSecond - currentMilliseconds;

  return remainingMilliseconds;
}
