import React from 'react';
import Footer from '@theme-original/Footer';

export default function FooterWrapper(props) {
  return (
    <>
      <footer className="footerJoin">
        <p>
          <b>Help us make a better web!</b>{" "}
          <a href="https://10up.com/careers/" target="_blank">
            Join 10up’s globally distributed and remote team.
          </a>
        </p>
      </footer>
      <Footer {...props} />
      <footer className="footerLegal">
        <div className="content-wrapper">
          <p>
            <a href="https://10up.com">10up.com</a>
          </p>
        </div>
      </footer>
    </>
  );
}
