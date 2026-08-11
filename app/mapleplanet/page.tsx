import type { Metadata } from 'next';
import { mapleplanet, buildMetadata } from '../data/servers';
import ServerDetail from '../components/ServerDetail';

export const metadata: Metadata = buildMetadata(mapleplanet);

export default function Page() {
  return <ServerDetail data={mapleplanet} />;
}
