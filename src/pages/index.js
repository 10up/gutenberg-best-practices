import React from 'react';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Link from '@docusaurus/Link';

import styles from './index.module.css';


export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="Description will go into a meta tag in <head />">
      <main>
        <header className={styles.heroBanner}>
          <img src="img/final-g-wapuu-white.svg" height="120" className={styles.wapuu} />
          <h1>Welcome to the 10up Gutenberg Best Practices!</h1>
        </header>
        <section className={styles.grid}>
          <article className={styles.gridItem}>
            <h2>
             🧑‍🏫
              <Link to="/training"> Training</Link>
            </h2>
          </article>
          <article className={styles.gridItem}>
            <h2>
              🚀
              <Link to="/guides"> Guides</Link>
            </h2>
          </article>
          <article className={styles.gridItem}>
            <h2>
              📚
              <Link to="/reference"> Reference</Link>
            </h2>
          </article>
        </section>
      </main>
    </Layout>
  );
}
