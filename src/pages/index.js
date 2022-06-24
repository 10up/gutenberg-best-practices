import React from 'react';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Link from '@docusaurus/Link';
import SearchBar from '@theme/SearchBar';

import styles from './index.module.css';
import guideSketch from '@site/static/img/guides-sketch.png';
import referenceSketch from '@site/static/img/reference-sketch.png';
import trainingSketch from '@site/static/img/training-sketch.png';

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="Description will go into a meta tag in <head />">
      <main>
        <header className={styles.heroBanner}>
          <h1>Welcome to the 10up Gutenberg Best Practices!</h1>
		  <p>The go-to place for all your Gutenberg questions</p>
		  <SearchBar className={styles.searchBar} />
        </header>
        <section className={styles.grid}>
        <article className={`${styles.gridItem} home_grid-item`}>
			<img src={referenceSketch} alt="" />
            <h2>
              <Link to="/reference"> Reference</Link>
            </h2>
			<p>This is where you will find detailed information about how we approach building blocks at 10up. The reference documentation is structured into a few different sections.</p>
          </article>
          <article className={`${styles.gridItem} home_grid-item`}>
		  <img src={trainingSketch} alt="" />
            <h2>
              <Link to="/training"> Training</Link>
            </h2>
			<p>The purpose of this project is to help you build and customize (Gutenberg) blocks. This training applies to all engineering disciplines at 10up.</p>
          </article>
          <article className={`${styles.gridItem} home_grid-item`}>
			<img src={guideSketch} alt="" />
            <h2>
              <Link to="/guides"> Guides</Link>
            </h2>
			<p>This section of the Gutenberg Best Practices is meant as a collection of individual deep dive articles. You are also welcome to contribute article so this guide!</p>
          </article>
        </section>
      </main>
    </Layout>
  );
}
