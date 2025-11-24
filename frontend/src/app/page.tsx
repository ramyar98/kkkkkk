// src/app/page.tsx

import DynamicCodeWorkspace from '../pages/Dynamic_Code_Workspace/DynamicCodeWorkspace';

/**
 * @page HomePage - The primary code workspace for the user.
 * ئەمە پەڕەی سەرەکییە کە تێیدا هەموو لۆژیکی Workspaceی گۆڕاو جێبەجێ دەکرێت.
 */
export default function HomePage() {
  return (
    // بە Layout.tsx دەورەدراوە کە MobileNavBar و DesktopNavBarی تێدایە.
    <DynamicCodeWorkspace />
  );
}
