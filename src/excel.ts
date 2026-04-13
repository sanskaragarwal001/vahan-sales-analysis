import { join } from "path";
import { readSheet, parseData, Schema } from "read-excel-file/node";

const months = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];
const schema = {
  sno: {
    column: "S No",
    type: StringToNumber,
  },
  maker: {
    column: "Maker",
    type: String,
    default: 0,
  },
  jan: {
    column: "JAN",
    type: StringToNumber,
  },
  feb: {
    column: "FEB",
    type: StringToNumber,
  },
  mar: {
    column: "MAR",
    type: StringToNumber,
  },
  apr: {
    column: "APR",
    type: StringToNumber,
  },
  may: {
    column: "MAY",
    type: StringToNumber,
  },
  jun: {
    column: "JUN",
    type: StringToNumber,
  },
  jul: {
    column: "JUL",
    type: StringToNumber,
  },
  aug: {
    column: "AUG",
    type: StringToNumber,
  },
  sep: {
    column: "SEP",
    type: StringToNumber,
  },
  oct: {
    column: "OCT",
    type: StringToNumber,
  },
  nov: {
    column: "NOV",
    type: StringToNumber,
  },
  dec: {
    column: "DEC",
    type: StringToNumber,
  },
  total: {
    column: "TOTAL",
    type: StringToNumber,
  },
};

export async function convertExcelSalesRecordIntoJson() {
  const filePath = join(process.cwd(), "downloads", "reportTable.xlsx");

  const data = await readSheet(filePath);
  if (data.length <= 4) return [];

  data.shift();
  data.shift();
  data.shift();

  const numberOfMonthsPresent = Array.isArray(data[0]) && data[0].length - 3;
  if (typeof numberOfMonthsPresent === "boolean") {
    return [];
  }

  const monthsToInclude = [];

  for (let i = 0; i < numberOfMonthsPresent; i++) {
    monthsToInclude.push(months[i]);
  }

  const expectedColumns = ["S No", "Maker", ...monthsToInclude, "TOTAL"];
  // @ts-ignore
  data[0] = expectedColumns;

  const objects = [];
  const results = parseData(data, schema as Schema);
  for (const { errors: errorsInRow, object } of results) {
    if (errorsInRow) {
      console.error(errorsInRow);
    } else {
      objects.push(object);
    }
  }

  return objects;
}

function StringToNumber(val: string) {
  if (typeof val !== "string") return NaN;

  val = val.replace(/,/g, "");

  const toReturn = Number(val);
  return toReturn;
}
