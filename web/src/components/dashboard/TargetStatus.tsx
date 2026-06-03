import {
  Badge,
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Text,
  Title,
} from "@tremor/react";
import { useEffect, useState } from "react";
import { getTargets } from "../../api.js";
import { useDashboardPeriod } from "../../context/DashboardPeriodContext.js";
import type { RagStatus, TargetStatusItem } from "../../types.js";

function ragBadgeColor(status: RagStatus): "emerald" | "amber" | "red" {
  switch (status) {
    case "green":
      return "emerald";
    case "amber":
      return "amber";
    case "red":
      return "red";
  }
}

export function TargetStatus() {
  const { period, facilityId } = useDashboardPeriod();
  const [targets, setTargets] = useState<TargetStatusItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    void getTargets(period, facilityId)
      .then((data) => {
        if (!cancelled) {
          setTargets(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Failed to load target status");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [period, facilityId]);

  return (
    <Card>
      <Title>Target vs actual</Title>
      <Text className="mt-1 text-gray-600">
        RAG status: green on target, amber within 10%, red beyond.
      </Text>

      {error && <Text className="mt-3 text-sm text-red-600">{error}</Text>}

      <Table className="mt-4">
        <TableHead>
          <TableRow>
            <TableHeaderCell>Metric</TableHeaderCell>
            <TableHeaderCell>Facility</TableHeaderCell>
            <TableHeaderCell>Actual</TableHeaderCell>
            <TableHeaderCell>Target</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading && (
            <TableRow>
              <TableCell colSpan={5}>
                <Text>Loading targets…</Text>
              </TableCell>
            </TableRow>
          )}
          {!loading && targets.length === 0 && (
            <TableRow>
              <TableCell colSpan={5}>
                <Text>No targets configured for this period.</Text>
              </TableCell>
            </TableRow>
          )}
          {!loading &&
            targets.map((row) => (
              <TableRow key={`${row.metric}-${row.facility ?? "all"}`}>
                <TableCell>{row.metric}</TableCell>
                <TableCell>{row.facility ?? "All facilities"}</TableCell>
                <TableCell>{row.actual.toLocaleString()}</TableCell>
                <TableCell>{row.target.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge color={ragBadgeColor(row.rag)}>{row.rag}</Badge>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </Card>
  );
}
