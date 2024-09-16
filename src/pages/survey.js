import React from 'react';
import Layout from '@theme/Layout';
import '../styles/Survey.scss';

export default function Survey() {
  return (
    <Layout
      title="Shipyard Survey"
      description="Documentation | Shipyard, a self-hosted dashboard for your homelab">
      <main className="survey">
        <iframe id="shipyard-survey" src="https://n9fy6xak9yd.typeform.com/to/gl0L68ou"></iframe>
      </main>
    </Layout>
  );
}
