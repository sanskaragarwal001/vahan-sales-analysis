import { join } from "path";
import { readSheet, parseData } from "read-excel-file/node";

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
    type: Number,
  },
  maker: {
    column: "Maker",
    type: String,
    default: 0,
  },
  jan: {
    column: "JAN",
    type: Number,
  },
  feb: {
    column: "FEB",
    type: Number,
  },
  mar: {
    column: "MAR",
    type: Number,
  },
  apr: {
    column: "APR",
    type: Number,
  },
  may: {
    column: "MAY",
    type: Number,
  },
  jun: {
    column: "JUN",
    type: Number,
  },
  jul: {
    column: "JUL",
    type: Number,
  },
  aug: {
    column: "AUG",
    type: Number,
  },
  sep: {
    column: "SEP",
    type: Number,
  },
  oct: {
    column: "OCT",
    type: Number,
  },
  nov: {
    column: "NOV",
    type: Number,
  },
  dec: {
    column: "DEC",
    type: Number,
  },
  total: {
    column: "TOTAL",
    type: Number,
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
  data[0] = expectedColumns;

  const objects = [];
  const results = parseData(data, schema);
  for (const { errors: errorsInRow, object } of results) {
    if (errorsInRow) {
      console.error(errorsInRow);
    } else {
      objects.push(object);
    }
  }

  return objects;
}
