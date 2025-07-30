import type { Config } from "jest";

export default {
  preset: "ts-jest",
  testEnvironment: "jest-fixed-jsdom",
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: "tsconfig.test.json" }],
  },
  "moduleNameMapper": {
    '^ai/rsc$': '<rootDir>/node_modules/ai/rsc/dist'
  },
} satisfies Config;
