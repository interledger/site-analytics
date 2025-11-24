/* eslint-disable no-console */
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

/**
 * Setup SSL certificates from base64-encoded environment variables
 * This is needed for Netlify and other build environments where you can't
 * directly upload certificate files but can set environment variables
 */

const setupSSLCerts = () => {
  const { PGSSLKEY_B64, PGSSLCERT_B64, PGSSLROOTCERT_B64 } = process.env;

  // Skip if none of the SSL cert environment variables are set
  if (!PGSSLKEY_B64 && !PGSSLCERT_B64 && !PGSSLROOTCERT_B64) {
    console.log('No SSL certificate environment variables found. Skipping SSL setup.');
    return;
  }

  // Create a temporary directory for certificates
  const certDir = join(tmpdir(), 'postgresql-certs');

  try {
    mkdirSync(certDir, { recursive: true });
  } catch (err) {
    console.error('Failed to create certificate directory:', err);
    process.exit(1);
  }

  // Decode and write SSL key
  if (PGSSLKEY_B64) {
    const keyPath = join(certDir, 'client-key.pem');
    try {
      const keyContent = Buffer.from(PGSSLKEY_B64, 'base64').toString('utf-8');
      writeFileSync(keyPath, keyContent, { mode: 0o600 });
      process.env.PGSSLKEY = keyPath;
      console.log(`✓ SSL key written to ${keyPath}`);
    } catch (err) {
      console.error('Failed to write SSL key:', err);
      process.exit(1);
    }
  }

  // Decode and write SSL certificate
  if (PGSSLCERT_B64) {
    const certPath = join(certDir, 'client-cert.pem');
    try {
      const certContent = Buffer.from(PGSSLCERT_B64, 'base64').toString('utf-8');
      writeFileSync(certPath, certContent, { mode: 0o600 });
      process.env.PGSSLCERT = certPath;
      console.log(`✓ SSL certificate written to ${certPath}`);
    } catch (err) {
      console.error('Failed to write SSL certificate:', err);
      process.exit(1);
    }
  }

  // Decode and write SSL root certificate
  if (PGSSLROOTCERT_B64) {
    const rootCertPath = join(certDir, 'server-ca.pem');
    try {
      const rootCertContent = Buffer.from(PGSSLROOTCERT_B64, 'base64').toString('utf-8');
      writeFileSync(rootCertPath, rootCertContent, { mode: 0o600 });
      process.env.PGSSLROOTCERT = rootCertPath;
      console.log(`✓ SSL root certificate written to ${rootCertPath}`);
    } catch (err) {
      console.error('Failed to write SSL root certificate:', err);
      process.exit(1);
    }
  }

  console.log('✓ SSL certificates setup complete');
};

setupSSLCerts();
