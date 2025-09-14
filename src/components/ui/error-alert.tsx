import { AlertCircle, RefreshCw, Wifi, Clock, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ErrorAlertProps {
  error: string;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export function ErrorAlert({ error, onRetry, isRetrying }: ErrorAlertProps) {
  const getErrorType = (errorMessage: string) => {
    if (errorMessage.includes('conexão') || errorMessage.includes('internet')) {
      return {
        icon: <Wifi className="h-5 w-5" />,
        title: "Problema de Conexão",
        type: "network"
      };
    }

    if (errorMessage.includes('servidores') || errorMessage.includes('indisponíveis') || errorMessage.includes('500')) {
      return {
        icon: <AlertTriangle className="h-5 w-5" />,
        title: "Servidores Sobrecarregados",
        type: "server"
      };
    }

    if (errorMessage.includes('cota') || errorMessage.includes('limite') || errorMessage.includes('429')) {
      return {
        icon: <Clock className="h-5 w-5" />,
        title: "Limite Temporário",
        type: "rate-limit"
      };
    }

    return {
      icon: <AlertCircle className="h-5 w-5" />,
      title: "Erro no Processamento",
      type: "general"
    };
  };

  const { icon, title, type } = getErrorType(error);

  const getBgColor = (type: string) => {
    switch (type) {
      case "network":
        return "bg-blue-50 border-blue-200 dark:bg-blue-950/20";
      case "server":
        return "bg-orange-50 border-orange-200 dark:bg-orange-950/20";
      case "rate-limit":
        return "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20";
      default:
        return "bg-red-50 border-red-200 dark:bg-red-950/20";
    }
  };

  const getTextColor = (type: string) => {
    switch (type) {
      case "network":
        return "text-blue-700 dark:text-blue-300";
      case "server":
        return "text-orange-700 dark:text-orange-300";
      case "rate-limit":
        return "text-yellow-700 dark:text-yellow-300";
      default:
        return "text-red-700 dark:text-red-300";
    }
  };

  return (
    <Card className={`border-2 ${getBgColor(type)}`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-3">
          <div className={`shrink-0 ${getTextColor(type)}`}>
            {icon}
          </div>
          <div className="flex-1 space-y-2">
            <h4 className={`font-medium ${getTextColor(type)}`}>
              {title}
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {error}
            </p>
            {onRetry && (
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRetry}
                  disabled={isRetrying}
                  className="gap-2"
                >
                  {isRetrying ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Tentando novamente...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      Tentar Novamente
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}