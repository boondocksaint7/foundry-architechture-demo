import React, { useMemo, useState } from "react";
import { useOsdkObjects } from "@osdk/react";
import { Button, ButtonGroup, Callout, Icon, Spinner, Tag } from "@blueprintjs/core";
import { Shipment, ShipmentException, TrackingEvent } from "@vrl-shipment-network/sdk";
import ControlTowerView from "@/components/ControlTowerView";
import ExceptionCenterView from "@/components/ExceptionCenterView";
import ShipmentOperationsView from "@/components/ShipmentOperationsView";
import type { ControlTowerPage, ExceptionRecord, ShipmentRecord } from "@/controlTower";
import css from "./Home.module.css";

const PAGE_LABELS: Record<ControlTowerPage, string> = {
  "control-tower": "Control Tower",
  "exception-center": "Exception Center",
  "shipment-operations": "Shipment Operations",
};

function Home(): React.ReactElement {
  const [activePage, setActivePage] = useState<ControlTowerPage>("control-tower");
  const [selectedExceptionKey, setSelectedExceptionKey] = useState<string>();
  const [selectedShipmentKey, setSelectedShipmentKey] = useState<string>();

  const shipmentQuery = useOsdkObjects(Shipment, {
    pageSize: 500,
    autoFetchMore: 5000,
    streamUpdates: true,
  });
  const exceptionQuery = useOsdkObjects(ShipmentException, {
    pageSize: 500,
    autoFetchMore: 5000,
    streamUpdates: true,
  });
  const trackingQuery = useOsdkObjects(TrackingEvent, {
    pageSize: 500,
    autoFetchMore: 5000,
    streamUpdates: true,
  });

  const shipments = useMemo(() => shipmentQuery.data ?? [], [shipmentQuery.data]);
  const exceptions = useMemo(() => exceptionQuery.data ?? [], [exceptionQuery.data]);
  const trackingEvents = useMemo(() => trackingQuery.data ?? [], [trackingQuery.data]);

  const errors = [shipmentQuery.error, exceptionQuery.error, trackingQuery.error].filter(Boolean);
  const isLoading = shipmentQuery.isLoading || exceptionQuery.isLoading || trackingQuery.isLoading;
  const hasAnyData = shipments.length + exceptions.length + trackingEvents.length > 0;
  const isPartial =
    Number(shipmentQuery.totalCount ?? shipments.length) > shipments.length ||
    Number(exceptionQuery.totalCount ?? exceptions.length) > exceptions.length ||
    Number(trackingQuery.totalCount ?? trackingEvents.length) > trackingEvents.length;

  const openException = (exception: ExceptionRecord): void => {
    setSelectedExceptionKey(exception.exceptionEventId);
    setActivePage("exception-center");
  };

  const openShipment = (shipment: ShipmentRecord): void => {
    setSelectedShipmentKey(shipment.shipmentId);
    setActivePage("shipment-operations");
  };

  const refreshAll = (): void => {
    void shipmentQuery.refetch();
    void exceptionQuery.refetch();
    void trackingQuery.refetch();
  };

  return (
    <main className={css.app}>
      <header className={css.appHeader}>
        <div className={css.brand}>
          <span className={css.brandIcon}>
            <Icon icon="application" size={20} />
          </span>
          <div>
            <span className={css.eyebrow}>VRL Logistics</span>
            <h1>Logistics Control Tower</h1>
          </div>
        </div>

        <nav className={css.navigation} aria-label="Control Tower pages">
          <ButtonGroup minimal>
            <Button
              active={activePage === "control-tower"}
              icon="dashboard"
              onClick={() => setActivePage("control-tower")}
            >
              Control Tower
            </Button>
            <Button
              active={activePage === "exception-center"}
              icon="warning-sign"
              onClick={() => setActivePage("exception-center")}
            >
              Exception Center
            </Button>
            <Button
              active={activePage === "shipment-operations"}
              icon="box"
              onClick={() => setActivePage("shipment-operations")}
            >
              Shipment Operations
            </Button>
          </ButtonGroup>
        </nav>

        <div className={css.headerStatus}>
          <Tag minimal intent={errors.length > 0 ? "danger" : "success"}>
            {errors.length > 0 ? "Data issue" : "Live Ontology data"}
          </Tag>
          <Button
            minimal
            icon="refresh"
            aria-label="Refresh all operational data"
            loading={isLoading && hasAnyData}
            onClick={refreshAll}
          />
        </div>
      </header>

      <div className={css.mobileNavigation}>
        <label htmlFor="mobile-page-select">Workspace</label>
        <select
          id="mobile-page-select"
          value={activePage}
          onChange={(event) => setActivePage(event.currentTarget.value as ControlTowerPage)}
        >
          {Object.entries(PAGE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <section className={css.content}>
        {errors.length > 0 && (
          <Callout intent="danger" title="Some operational data could not be loaded">
            {errors
              .map((error) => (error instanceof Error ? error.message : String(error)))
              .join(" · ")}
          </Callout>
        )}

        {isPartial && (
          <Callout intent="warning" compact>
            One or more object types contain more records than the configured 5,000-object
            client-side loading limit. Metrics and queues reflect the loaded set.
          </Callout>
        )}

        {!hasAnyData && isLoading ? (
          <div className={css.initialLoading}>
            <Spinner size={36} />
            <div>
              <strong>Building the Logistics Control Tower</strong>
              <span>Loading shipments, exceptions and journey scans from the Ontology…</span>
            </div>
          </div>
        ) : (
          <>
            {activePage === "control-tower" && (
              <ControlTowerView
                shipments={shipments}
                exceptions={exceptions}
                onOpenException={openException}
                onOpenShipment={openShipment}
              />
            )}
            {activePage === "exception-center" && (
              <ExceptionCenterView
                exceptions={exceptions}
                selectedExceptionKey={selectedExceptionKey}
                onSelectException={(exception) =>
                  setSelectedExceptionKey(exception.exceptionEventId)
                }
              />
            )}
            {activePage === "shipment-operations" && (
              <ShipmentOperationsView
                shipments={shipments}
                trackingEvents={trackingEvents}
                selectedShipmentKey={selectedShipmentKey}
                onSelectShipment={(shipment) => setSelectedShipmentKey(shipment.shipmentId)}
              />
            )}
          </>
        )}
      </section>
    </main>
  );
}

export default Home;
