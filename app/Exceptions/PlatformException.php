<?php

namespace App\Exceptions;

use Exception;

class PlatformException extends Exception
{
    protected $platform;
    protected $operation;
    protected $userId;

    public function __construct(
        string $message,
        string $platform,
        string $operation,
        int $userId = null,
        int $code = 0,
        \Throwable $previous = null
    ) {
        parent::__construct($message, $code, $previous);
        $this->platform = $platform;
        $this->operation = $operation;
        $this->userId = $userId;
    }

    public function getPlatform(): string
    {
        return $this->platform;
    }

    public function getOperation(): string
    {
        return $this->operation;
    }

    public function getUserId(): ?int
    {
        return $this->userId;
    }

    public function getContext(): array
    {
        return [
            'platform' => $this->platform,
            'operation' => $this->operation,
            'user_id' => $this->userId,
            'error' => $this->getMessage(),
        ];
    }
}
