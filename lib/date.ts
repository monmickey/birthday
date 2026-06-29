const DATE_TIME_LOCAL_PATTERN = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/;

export function parseBirthdayDate(value: string): Date {
  const localMatch = value.match(DATE_TIME_LOCAL_PATTERN);

  if (localMatch && !value.endsWith("Z")) {
    const [, year, month, day, hour, minute, second = "0"] = localMatch;
    return new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second)
    );
  }

  return new Date(value);
}

export function formatDateTimeLocalValue(value: string): string {
  const date = parseBirthdayDate(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const pad = (part: number) => part.toString().padStart(2, "0");

  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join("-") + `T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
