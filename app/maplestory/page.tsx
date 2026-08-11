import type { Metadata } from 'next';
import { maplestory, buildMetadata } from '../data/servers';
import ServerDetail from '../components/ServerDetail';

export const metadata: Metadata = buildMetadata(maplestory);

export default function Page() {
  return <ServerDetail data={maplestory} />;
}
