/**
 * STEP 12
 * Delete "-lift" from the file name and change the extension to .html.
 * The content itself is unchanged from Step 11 - no markup is added.
 */
export function step12Finalize(originalFileName: string): string {
  const withoutExt = originalFileName.replace(/\.txt$/i, "");
  const withoutLift = withoutExt.replace(/-lift$/i, "");
  return `${withoutLift}.html`;
}
