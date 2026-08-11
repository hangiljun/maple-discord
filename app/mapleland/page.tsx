import type { Metadata } from 'next';
import { mapleland, buildMetadata } from '../data/servers';
import ServerDetail from '../components/ServerDetail';

export const metadata: Metadata = buildMetadata(mapleland);

export default function Page() {
  return <ServerDetail data={mapleland} />;
}
