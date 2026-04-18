import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const items = [
  { name: "Steak Sapi", value: 42, max: 42, color: "bg-red-700" },
  { name: "Salad Campur", value: 28, max: 42, color: "bg-green-700" },
  { name: "Ikan Panggang", value: 18, max: 42, color: "bg-green-600" },
  { name: "Sup Tomat", value: 12, max: 42, color: "bg-green-500" },
];

export default function WastePerMenuItem() {
  return (
    <Card className="rounded-2xl border-0 bg-white shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold leading-snug text-[#1a2e1a]">
          Limbah per Item Menu Berdampak Tinggi
        </CardTitle>
        <Tabs defaultValue="berat" className="mt-2">
          <TabsList className="h-8 rounded-full bg-gray-100 p-1 text-xs">
            <TabsTrigger value="berat" className="rounded-full px-3 text-xs">
              Berat (kg)
            </TabsTrigger>
            <TabsTrigger value="kerugian" className="rounded-full px-3 text-xs">
              Kerugian (Rp)
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="space-y-4 pt-2">
        {items.map((item) => (
          <div key={item.name}>
            <div className="mb-1 flex justify-between text-sm">
              <span className="font-medium text-[#1a2e1a]">{item.name}</span>
              <span className="font-semibold">{item.value} kg</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className={`h-full rounded-full ${item.color}`}
                style={{ width: `${(item.value / item.max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
