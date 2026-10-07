'use client';

import dynamic from 'next/dynamic';

const MapOverviewInner = dynamic(
  () => import('./MapOverviewInner').then((mod) => mod.MapOverviewInner),
  { ssr: false }
);

type FieldData = {
    id: string;
    name: string;
    coordinates: string;
    ownerId: string;
    imagesDates: string[];
    created_at: Date;
    updated_at: Date;
};

export function MapOverview({ fields }: { fields: FieldData[] }) {
  return <MapOverviewInner fields={fields} />;
}
