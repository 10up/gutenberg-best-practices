// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'My Site',
  tagline: 'Dinosaurs are cool',
  url: 'https://your-docusaurus-test-site.com',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: '10up', // Usually your GitHub org/user name.
  projectName: 'docusaurus', // Usually your repo name.

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: false,
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  plugins: [
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'guides',
        path: 'guides',
        routeBasePath: 'guides',
        sidebarPath: require.resolve('./sidebars.js'),
        showLastUpdateTime: true,
        showLastUpdateAuthor: true,
        editUrl: 'https://github.com/10up/gutenberg-best-practices/tree/main/',
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'training',
        path: 'training',
        routeBasePath: 'training',
        sidebarPath: require.resolve('./sidebars.js'),
        showLastUpdateTime: true,
        showLastUpdateAuthor: true,
        editUrl: 'https://github.com/10up/gutenberg-best-practices/tree/main/',
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        path: 'reference',
        routeBasePath: 'reference',
        sidebarPath: require.resolve('./sidebars.js'),
        showLastUpdateTime: true,
        showLastUpdateAuthor: true,
        editUrl: 'https://github.com/10up/gutenberg-best-practices/tree/main/',
      },
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'Gutenberg Best Practices',
        logo: {
          src: 'img/10up-logo-full.svg'
        },
        items: [
          {
            type: 'doc',
            docId: 'reference',
            position: 'right',
            label: 'Reference',
          },
          {
            type: 'doc',
            docId: 'training',
            position: 'right',
            label: 'Training',
            docsPluginId: 'training'
          },
          {
            type: 'doc',
            docId: 'guides',
            position: 'right',
            label: 'Guides',
            docsPluginId: 'guides'
          }
        ],
      },
      footer: {
        style: 'light',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Reference',
                to: '/reference/reference',
              },
              {
                label: 'Training',
                to: '/training/training',
              },
              {
                label: 'Guides',
                to: '/guides/guides',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Slack Channel',
                href: 'https://10up.slack.com/archives/C8Z3WMN1K',
              }
            ],
          },
          {
            title: 'Resources',
            items: [
              {
                label: 'Block Components',
                href: 'https://github.com/10up/block-components',
              },
              {
                label: 'Block Library',
                href: 'https://github.com/10up/block-library',
              },
              {
                label: 'Block Examples',
                href: 'https://github.com/10up/block-examples',
              },
            ],
          },
        ],
        logo: {
          src: "img/10up-logo-full.svg",
          height: 50,
          width: 50,
          href: 'https://10up.com',
        },
        copyright:`🚀 10up Gutenberg Best Practices`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
        additionalLanguages: ['php', 'bash'],
      },
    }),
};

module.exports = config;
