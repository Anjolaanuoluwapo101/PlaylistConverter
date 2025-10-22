<?php

namespace App\Exceptions;

use Exception;

class ApiException extends Exception
{
    protected $service;
    protected $endpoint;
    protected $method;
    protected $statusCode;
    protected $responseBody;

    public function __construct(
        string $message,
        string $service,
        string $endpoint,
        string $method = 'GET',
        int $statusCode = null,
        string $responseBody = null,
        int $code = 0,
        \Throwable $previous = null
    ) {
        parent::__construct($message, $code, $previous);
        $this->service = $service;
        $this->endpoint = $endpoint;
        $this->method = $method;
        $this->statusCode = $statusCode;
        $this->responseBody = $responseBody;
    }

    public function getService(): string
    {
        return $this->service;
    }

    public function getEndpoint(): string
    {
        return $this->endpoint;
    }

    public function getMethod(): string
    {
        return $this->method;
    }

    public function getStatusCode(): ?int
    {
        return $this->statusCode;
    }

    public function getResponseBody(): ?string
    {
        return $this->responseBody;
    }

    public function getContext(): array
    {
        return [
            'service' => $this->service,
            'endpoint' => $this->endpoint,
            'method' => $this->method,
            'status_code' => $this->statusCode,
            'response_body' => $this->responseBody,
            'error' => $this->getMessage(),
        ];
    }
}
