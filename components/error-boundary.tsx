"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[v0] Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="max-w-md w-full border-destructive/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <CardTitle className="text-destructive">Application Error</CardTitle>
              </div>
              <CardDescription>
                Something went wrong, but your data is safe
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-secondary/50 p-3 rounded-md">
                <p className="text-sm font-mono text-destructive">
                  {this.state.error?.message || "Unknown error occurred"}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  The app is running in offline mode. Your execution logs are stored locally and safe.
                </p>
                <p className="text-sm text-muted-foreground">
                  Try refreshing the page to continue.
                </p>
              </div>
              <Button
                onClick={() => window.location.reload()}
                className="w-full"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Page
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
