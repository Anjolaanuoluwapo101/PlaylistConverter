<?php

namespace App\Exceptions;

use Exception;

class AuthenticationException extends Exception
{
    protected $platform;
    protected $userId;
    protected $operation;

    public function __construct(
        string $message,
        string $platform,
        int $userId = null,
        string $operation = 'authentication',
        int $code = 0,
        \Throwable $previous = null
    ) {
        parent::__construct($message, $code, $previous);
        $this->platform = $platform;
        $this->userId = $userId;
        $this->operation = $operation;
    }

    public function getPlatform(): string
    {
        return $this->platform;
    }

    public function getUserId(): ?int
    {
        return $this->userId;
    }

    public function getOperation(): string
    {
        return $this->operation;
    }

    public function getContext(): array
    {
        return [
            'platform' => $this->platform,
            'user_id' => $this->userId,
            'operation' => $this->operation,
            'error' => $this->getMessage(),
        ];
    }
}
