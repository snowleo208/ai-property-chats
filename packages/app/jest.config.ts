import type { Config } from "jest";

export default {
  preset: "ts-jest",
  testEnvironment: "jest-fixed-jsdom",
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: "tsconfig.test.json" }],

  },
  "moduleNameMapper": {
    '^ai/rsc$': '<rootDir>/node_modules/ai/rsc/dist',
    "react-markdown": "<rootDir>/ReactMarkdownMock.tsx",
    "\\.(css|jpg|png)$": "<rootDir>/mock-file.ts",
  },
  setupFilesAfterEnv: ["<rootDir>/jest-setup-after.ts"],
} satisfies Config;
