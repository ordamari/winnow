function quote(file) {
  return `"${file}"`;
}

export default {
  "apps/web/**/*.{js,jsx,ts,tsx,mjs,cjs}": (files) => {
    const quoted = files.map(quote).join(" ");
    return [
      `prettier --write ${quoted}`,
      `pnpm --filter @winnow/web exec eslint --fix ${quoted}`,
    ];
  },
  "packages/**/*.{js,jsx,ts,tsx,mjs,cjs}": (files) => {
    const quoted = files.map(quote).join(" ");
    return [`prettier --write ${quoted}`, `eslint --fix ${quoted}`];
  },
  "*.{json,css,md,yml,yaml}": "prettier --write",
};
