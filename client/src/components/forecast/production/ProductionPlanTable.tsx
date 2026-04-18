import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SlidersHorizontal, Download, Minus, Plus } from "lucide-react";
import { useState } from "react";

type StatusType = "aman" | "risiko";

const initialItems = [
  {
    id: 1,
    img: "🥗",
    name: "Signature Garden Bowl",
    prediksi: "145 Unit",
    input: 150,
    status: "aman" as StatusType,
  },
  {
    id: 2,
    img: "🍅",
    name: "Roasted Tomato Bisque",
    prediksi: "85 Unit",
    input: 95,
    status: "risiko" as StatusType,
  },
  {
    id: 3,
    img: "🫙",
    name: "Mediterranean Mezze Bowl",
    prediksi: "210 Unit",
    input: 215,
    status: "aman" as StatusType,
  },
];

export default function ProductionPlanTable() {
  const [items, setItems] = useState(initialItems);

  const updateInput = (id: number, delta: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, input: Math.max(0, item.input + delta) }
          : item,
      ),
    );
  };

  return (
    <Card className="rounded-2xl border-0 bg-white shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold text-[#1a2e1a]">
          Rencana Produksi & Peringatan Dini
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Download className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-100">
              <TableHead className="pl-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Menu
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Permintaan Prediksi
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Rencana Input
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Warning Status
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id} className="border-b border-gray-50">
                {/* Menu */}
                <TableCell className="pl-6 py-5">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{item.img}</span>
                    <span className="font-semibold text-[#1a2e1a] text-sm">
                      {item.name}
                    </span>
                  </div>
                </TableCell>

                {/* Prediksi */}
                <TableCell className="text-sm text-muted-foreground">
                  {item.prediksi}
                </TableCell>

                {/* Input stepper */}
                <TableCell>
                  <div
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2 w-fit ${
                      item.status === "risiko"
                        ? "border-orange-300 bg-orange-50"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <button
                      onClick={() => updateInput(item.id, -5)}
                      className="text-muted-foreground hover:text-[#1a2e1a] transition-colors"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span
                      className={`min-w-[60px] text-center text-sm font-bold ${
                        item.status === "risiko"
                          ? "text-orange-500"
                          : "text-[#1a2e1a]"
                      }`}
                    >
                      {item.input} Unit
                    </span>
                    <button
                      onClick={() => updateInput(item.id, 5)}
                      className="text-muted-foreground hover:text-[#1a2e1a] transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </TableCell>

                {/* Status */}
                <TableCell>
                  {item.status === "aman" ? (
                    <Badge className="rounded-full bg-green-100 text-green-700 font-semibold text-xs hover:bg-green-100 gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500 inline-block" />
                      AMAN
                    </Badge>
                  ) : (
                    <Badge className="rounded-full bg-orange-100 text-orange-700 font-semibold text-xs hover:bg-orange-100 gap-1.5">
                      ⚠ RISIKO LIMBAH TINGGI
                    </Badge>
                  )}
                </TableCell>

                {/* Aksi */}
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-muted-foreground hover:text-[#1a2e1a]"
                  >
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
