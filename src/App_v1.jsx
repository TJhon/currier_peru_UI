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
  Copy,
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
import { Toaster, toast } from "sonner";

// API call
const fetchTracking = async (trackingNumber) => {
  const response = await fetch(
    `https://pkg-tracker-peru-8o1lolicx-tjhons-projects.vercel.app/${trackingNumber}`
  );
  if (!response.ok) {
    throw new Error("Tracking number not found");
  }
  return await response.json();
};

function App() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [trackings, setTrackings] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilters, setActiveFilters] = useState([]);

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const result = await fetchTracking(trackingNumber);
      const existingIndex = trackings.findIndex(
        (t) => t.tracking_number === result.tracking_number
      );
      if (existingIndex !== -1) {
        const updatedTrackings = [...trackings];
        updatedTrackings[existingIndex] = result;
        updatedTrackings.unshift(updatedTrackings.splice(existingIndex, 1)[0]);
        setTrackings(updatedTrackings);
      } else {
        setTrackings([result, ...trackings]);
      }
      setTrackingNumber("");
      setError("");
    } catch (error) {
      setError("Tracking number not found");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (trackingNumber) => {
    setTrackings(trackings.filter((t) => t.tracking_number !== trackingNumber));
  };

  const handleUpdate = async (trackingNumber) => {
    try {
      const updatedTracking = await fetchTracking(trackingNumber);
      const updatedTrackings = trackings.map((t) =>
        t.tracking_number === trackingNumber ? updatedTracking : t
      );
      setTrackings([
        updatedTracking,
        ...updatedTrackings.filter((t) => t.tracking_number !== trackingNumber),
      ]);
    } catch (error) {
      console.error("Error updating tracking:", error);
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
      <div className="container mx-auto p-4">
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
                <Toaster />
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
                        activeFilters.includes(company) ? "default" : "outline"
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTrackings.map((tracking) => (
                    <Card
                      key={tracking.tracking_number}
                      className={`hover:shadow-lg transition-shadow ${getCardBorderColor(
                        tracking.service_name
                      )}`}
                    >
                      <CardHeader className="flex flex-col space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <Hash className="mr-2 h-4 w-4" />
                            <CardTitle>{tracking.tracking_number}</CardTitle>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              navigator.clipboard.writeText(
                                tracking.tracking_number
                              );
                              toast("El número de rastreo ha sido copiado.", {
                                description: tracking.tracking_number,
                              });
                            }}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex justify-between items-center">
                          <Badge
                            variant="outline"
                            className={getBadgeColor(tracking.service_name)}
                          >
                            {tracking.service_name.charAt(0).toUpperCase() +
                              tracking.service_name.slice(1)}
                          </Badge>
                          <div className="text-sm text-gray-500">
                            {tracking.states.last_state?.fecha_evento}
                          </div>
                        </div>
                        <div className="text-sm">
                          {tracking.states.last_state?.evento ||
                            "No hay descripción del evento"}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex flex-col items-start">
                            <span className="text-sm text-gray-500">
                              Origen
                            </span>
                            <span>{tracking.data.origen}</span>
                          </div>
                          <ArrowRight className="h-6 w-6 text-gray-400" />
                          <div className="flex flex-col items-end">
                            <span className="text-sm text-gray-500">
                              Destino
                            </span>
                            <span>{tracking.data.destino}</span>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={`mt-2 ${getStateBadgeColor(
                            tracking.states.last_state?.state
                          )}`}
                        >
                          {tracking.states.last_state?.state || "Desconocido"}
                        </Badge>
                        <div className="flex justify-between mt-4">
                          <div className="flex flex-col items-center">
                            <FileText
                              className={`h-6 w-6 ${
                                tracking.states.registro
                                  ? "text-green-500"
                                  : "text-gray-300"
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
                                tracking.states.destino
                                  ? "text-green-500"
                                  : "text-gray-300"
                              }`}
                            />
                            <span className="text-xs mt-1">Destino</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <Smile
                              className={`h-6 w-6 ${
                                tracking.states.entregado
                                  ? "text-green-500"
                                  : "text-gray-300"
                              }`}
                            />
                            <span className="text-xs mt-1">Entregado</span>
                          </div>
                        </div>
                        <div className="mt-4 flex flex-col sm:flex-row justify-between gap-2">
                          <Link
                            to={`/tracking/${tracking.tracking_number}`}
                            className="w-full sm:w-auto"
                          >
                            <Button variant="outline" className="w-full">
                              Ver detalles
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            onClick={() =>
                              handleUpdate(tracking.tracking_number)
                            }
                            className="w-full sm:w-auto"
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Actualizar
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                className="w-full sm:w-auto"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  ¿Estás seguro?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. Esto
                                  eliminará permanentemente el seguimiento de
                                  este envío.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleDelete(tracking.tracking_number)
                                  }
                                >
                                  Confirmar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            }
          />
          <Route
            path="/tracking/:id"
            element={
              <TrackingDetail
                trackings={trackings}
                setTrackings={setTrackings}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
              />
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

function TrackingDetail({ trackings, setTrackings, onDelete, onUpdate }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const tracking = trackings.find((t) => t.tracking_number === id);

  const handleUpdate = async () => {
    try {
      await onUpdate(id);
      navigate("/");
    } catch (error) {
      console.error("Error updating tracking:", error);
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
              const stateValue = key === "transito" ? value[0] : value;
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
                      onDelete(tracking.tracking_number);
                      navigate("/");
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
