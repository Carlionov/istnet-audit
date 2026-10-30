import type { JSX } from "react";
import { LocationLegendItem } from "@/components/sections/locations/LocationLegendItem";
import { GlobeVisual } from "@/components/sections/locations/GlobeVisual";
import { SERVER_LOCATIONS } from "@/data/servers";

export function Locations(): JSX.Element {
  return (
    <section className="container section" id="map">
      <h2 className="section-title reveal">Глобальная сеть</h2>
      <p className="section-subtitle reveal">
        Четыре локации в Европе, Америке и Азии — выбирай подходящую.
      </p>
      <div className="globe-wrap reveal">
        <GlobeVisual />
        <div className="globe-legend">
          {SERVER_LOCATIONS.map((location) => (
            <LocationLegendItem key={location.id} location={location} />
          ))}
        </div>
      </div>
      <p className="location-ping-note" id="locationPingNote">
        * Пинг на схеме — демонстрационный диапазон 42–94 мс, а не результат измерения. Реальные показатели появятся после подключения мониторинга.
      </p>
    </section>
  );
}
