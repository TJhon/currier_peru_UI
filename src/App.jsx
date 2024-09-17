import {
  BrowserRouter as Router,
  Route,
  Routes,
  Link,
  useParams,
  useNavigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  FileText,
  Truck,
  Building,
  Smile,
  Trash2,
  RefreshCw,
  Hash,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useTrackingStore } from "./store";
import { TrackingCard } from "./TrackingCard.jsx";

// API call

const requestURL =
  "https://pkg-tracker-peru-ihyozc51h-tjhons-projects.vercel.app/";

const fetchTracking = async (trackingNumber) => {
  const response = await fetch(`${requestURL}${trackingNumber}`);
  if (!response.ok) {
    throw new Error("Tracking number not found");
  }
  return await response.json();
};

function App() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilters, setActiveFilters] = useState([]);

  const { trackings, addTracking, updateTracking, deleteTracking } =
    useTrackingStore();

  const handleSearch = async () => {
    setIsLoading(true);
    if (trackingNumber.trim() === "") {
      return;
    }
    try {
      const result = await fetchTracking(trackingNumber);
      addTracking(result);
      setTrackingNumber("");
      setError("");
    } catch (error) {
      setError("Tracking number not found");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (trackingNumber) => {
    deleteTracking(trackingNumber);
  };

  const handleUpdate = async (trackingNumber) => {
    try {
      const updatedTracking = await fetchTracking(trackingNumber);
      updateTracking(updatedTracking);
    } catch (error) {
      console.error("Error updating tracking:", error);
    }
  };

  const handleUpdateAll = async () => {
    for (const tracking of trackings) {
      try {
        const updatedTracking = await fetchTracking(tracking.tracking_number);
        updateTracking(updatedTracking);
      } catch (error) {
        console.error(
          `Error updating tracking ${tracking.tracking_number}:`,
          error
        );
      }
    }
  };

  const filteredTrackings = trackings.filter(
    (tracking) =>
      (activeFilters.length === 0 ||
        activeFilters.includes(tracking.service_name.toLowerCase())) &&
      (tracking.data.origen.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tracking.data.destino
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        tracking.data.remitente
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        tracking.data.destinatario
          .toLowerCase()
          .includes(searchTerm.toLowerCase()))
  );

  const clearFilters = () => {
    setActiveFilters([]);
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <header className="sticky top-0 bg-background z-10 p-4 shadow-md">
          <div className="container mx-auto">
            <h1 className="text-2xl font-bold">
              Rastreo de Envíos - Curriers del Perú
            </h1>
          </div>
        </header>
        <main className="flex-grow container mx-auto p-4">
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <div className="mb-4 flex gap-2">
                    <Input
                      placeholder="Número de tracking"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                    />
                    <Button onClick={handleSearch} disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Buscando...
                        </>
                      ) : (
                        "Buscar"
                      )}
                    </Button>
                  </div>
                  {error && <p className="text-red-500 mb-4">{error}</p>}
                  <div className="mb-4">
                    <Input
                      placeholder="Buscar por origen, destino, remitente o destinatario"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="mb-4 flex gap-2 flex-wrap">
                    {["marvisur", "shalom", "olva"].map((company) => (
                      <Button
                        key={company}
                        variant={
                          activeFilters.includes(company)
                            ? "default"
                            : "outline"
                        }
                        onClick={() =>
                          setActiveFilters((prev) =>
                            prev.includes(company)
                              ? prev.filter((f) => f !== company)
                              : [...prev, company]
                          )
                        }
                      >
                        {company.charAt(0).toUpperCase() + company.slice(1)}
                      </Button>
                    ))}
                    {activeFilters.length > 0 && (
                      <Button onClick={clearFilters} variant="secondary">
                        Limpiar
                      </Button>
                    )}
                  </div>
                  <Button onClick={handleUpdateAll} className="mb-4">
                    Actualizar Todos
                  </Button>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTrackings.map((tracking) => (
                      <TrackingCard
                        key={tracking.tracking_number}
                        tracking={tracking}
                        onUpdate={handleUpdate}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                </>
              }
            />
            <Route
              path="/tracking/:id"
              element={
                <TrackingDetail
                  onDelete={handleDelete}
                  onUpdate={handleUpdate}
                />
              }
            />
          </Routes>
        </main>
        <footer className="bg-gray-100 py-4 text-center">
          <p>Desarrollador: Jhon FR y v0.dev</p>
        </footer>
      </div>
    </Router>
  );
}

function TrackingDetail({ onDelete, onUpdate }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { trackings } = useTrackingStore();
  const tracking = trackings.find((t) => t.tracking_number === id);

  const handleUpdate = async () => {
    if (id) {
      try {
        await onUpdate(id);
        navigate("/");
      } catch (error) {
        console.error("Error updating tracking:", error);
      }
    }
  };

  if (!tracking) return <div>Cargando...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Link to="/">
          <Button>Volver</Button>
        </Link>
        <Button onClick={handleUpdate}>Actualizar</Button>
      </div>
      <Card className={getCardBorderColor(tracking.service_name)}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Hash className="mr-2 h-4 w-4" />
              <CardTitle>{tracking.tracking_number}</CardTitle>
            </div>
            <Badge
              variant="outline"
              className={getBadgeColor(tracking.service_name)}
            >
              {tracking.service_name.charAt(0).toUpperCase() +
                tracking.service_name.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p>Remitente: {tracking.data.remitente}</p>
          <p>Destinatario: {tracking.data.destinatario}</p>
          <p>Origen: {tracking.data.origen}</p>
          <p>Destino: {tracking.data.destino}</p>
          <p>Tipo de entrega: {tracking.data.tipo_entrega}</p>
          <p>Monto a pagar: {tracking.data.monto_pagar}</p>
          <p>Contenido: {tracking.pkg_info[0].contenido}</p>
          {tracking.comprobante && (
            <p>
              <a
                href={tracking.comprobante}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                Ver comprobante
              </a>
            </p>
          )}
          <h3 className="mt-4 font-bold">Estados:</h3>
          {Object.entries(tracking.states).map(([key, value]) => {
            if (key !== "last_state" && value) {
              const stateValue = Array.isArray(value) ? value[0] : value;
              return (
                <div key={key} className="mt-2">
                  <Badge
                    variant="outline"
                    className={getStateBadgeColor(stateValue.state)}
                  >
                    {stateValue.state}
                  </Badge>
                  <p>
                    {stateValue.fecha_evento} -{" "}
                    {stateValue.evento || "No hay descripción del evento"}
                  </p>
                </div>
              );
            }
            return null;
          })}
          <div className="flex justify-between mt-4">
            <div className="flex flex-col items-center">
              <FileText
                className={`h-6 w-6 ${
                  tracking.states.registro ? "text-green-500" : "text-gray-300"
                }`}
              />
              <span className="text-xs mt-1">Registrado</span>
            </div>
            <div className="flex flex-col items-center">
              <Truck
                className={`h-6 w-6 ${
                  tracking.states.transito?.length > 0
                    ? "text-green-500"
                    : "text-gray-300"
                }`}
              />
              <span className="text-xs mt-1">Tránsito</span>
            </div>
            <div className="flex flex-col items-center">
              <Building
                className={`h-6 w-6 ${
                  tracking.states.destino ? "text-green-500" : "text-gray-300"
                }`}
              />
              <span className="text-xs mt-1">Destino</span>
            </div>
            <div className="flex flex-col items-center">
              <Smile
                className={`h-6 w-6 ${
                  tracking.states.entregado ? "text-green-500" : "text-gray-300"
                }`}
              />
              <span className="text-xs mt-1">Entregado</span>
            </div>
          </div>
          <div className="mt-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. Esto eliminará
                    permanentemente el seguimiento de este envío.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      if (id) {
                        onDelete(id);
                        navigate("/");
                      }
                    }}
                  >
                    Confirmar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function getCardBorderColor(serviceName) {
  switch (serviceName.toLowerCase()) {
    case "shalom":
      return "border-red-500 border-2";
    case "olva":
      return "border-orange-500 border-2";
    case "marvisur":
      return "border-purple-900 border-2";
    default:
      return "border-gray-200 border-2";
  }
}

function getBadgeColor(serviceName) {
  switch (serviceName.toLowerCase()) {
    case "shalom":
      return "bg-red-100 text-red-800 border-red-500";
    case "olva":
      return "bg-orange-100 text-orange-800 border-orange-500";
    case "marvisur":
      return "bg-purple-100 text-purple-800 border-purple-900";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

function getStateBadgeColor(state) {
  if (!state) return "bg-gray-200 text-gray-800";

  switch (state.toLowerCase()) {
    case "registrado":
      return "bg-yellow-200 text-yellow-800";
    case "transito":
      return "bg-blue-200 text-blue-800";
    case "destino":
      return "bg-purple-200 text-purple-800";
    case "entregado":
      return "bg-green-200 text-green-800";
    default:
      return "bg-gray-200 text-gray-800";
  }
}

export default App;
