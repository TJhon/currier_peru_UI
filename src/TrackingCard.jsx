import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Link } from "react-router-dom";
// import { toast } from "@/components/ui/use-toast";
import { Toaster, toast } from "sonner";
export function TrackingCard({ tracking, onUpdate, onDelete }) {
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast("El número de rastreo ha sido copiado.", {
      description: text,
    });
  };

  return (
    <Card
      className={`hover:shadow-lg transition-shadow ${getCardBorderColor(
        tracking.service_name
      )}`}
    >
      <Toaster />
      <CardHeader className="flex flex-col space-y-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Hash className="mr-2 h-4 w-4" />
            <CardTitle>{tracking.tracking_number}</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => copyToClipboard(tracking.tracking_number)}
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
            <span className="text-sm text-gray-500">Origen</span>
            <span>{tracking.data.origen}</span>
          </div>
          <ArrowRight className="h-6 w-6 text-gray-400" />
          <div className="flex flex-col items-end">
            <span className="text-sm text-gray-500">Destino</span>
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
        <div className="flex justify-between items-center mt-4">
          <div className="flex flex-col items-center">
            <FileText
              className={`h-6 w-6 ${
                tracking.states.registro ? "text-green-500" : "text-gray-300"
              }`}
            />
            <span className="text-xs mt-1">Registrado</span>
          </div>
          <div className="w-full mx-2 h-1 bg-gray-200 rounded-full">
            <div
              className="h-1 bg-green-500 rounded-full"
              style={{ width: `${getProgressPercentage(tracking.states)}%` }}
            ></div>
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
          <div className="w-full mx-2 h-1 bg-gray-200 rounded-full">
            <div
              className="h-1 bg-green-500 rounded-full"
              style={{ width: `${getProgressPercentage(tracking.states)}%` }}
            ></div>
          </div>
          <div className="flex flex-col items-center">
            <Building
              className={`h-6 w-6 ${
                tracking.states.destino ? "text-green-500" : "text-gray-300"
              }`}
            />
            <span className="text-xs mt-1">Destino</span>
          </div>
          <div className="w-full mx-2 h-1 bg-gray-200 rounded-full">
            <div
              className="h-1 bg-green-500 rounded-full"
              style={{ width: `${getProgressPercentage(tracking.states)}%` }}
            ></div>
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
            onClick={() => onUpdate(tracking.tracking_number)}
            className="w-full sm:w-auto"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full sm:w-auto">
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
                  onClick={() => onDelete(tracking.tracking_number)}
                >
                  Confirmar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
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

function getProgressPercentage(states) {
  if (states.entregado) return 100;
  if (states.destino) return 75;
  if (states.transito && states.transito.length > 0) return 50;
  if (states.registro) return 25;
  return 0;
}
