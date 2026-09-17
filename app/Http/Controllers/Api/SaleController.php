<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SaleController extends Controller
{
    public function index(Request $request)
    {
        $query = Sale::with('items');

        if ($request->from) {
            $query->whereDate('created_at', '>=', $request->from);
        }
        if ($request->to) {
            $query->whereDate('created_at', '<=', $request->to);
        }

        return response()->json(
            $query->orderByDesc('created_at')->paginate(50)
        );
    }

    public function store(Request $request)
    {
        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'payment_method' => 'nullable|string',
            'local_id' => 'nullable|string',
            'sale_date' => 'nullable|date',
            'sale_time' => 'nullable|string',
        ]);

        $vatRate = (float) Setting::getValue('vat_rate', '15');
        $receiptNumber = 'RCP-' . strtoupper(Str::random(8));

        return DB::transaction(function () use ($request, $vatRate, $receiptNumber) {
            $subtotal = 0;
            $saleItems = [];

            foreach ($request->items as $item) {
                $product = Product::lockForUpdate()->find($item['product_id']);

                if ($product->stock < $item['quantity']) {
                    throw \Illuminate\Validation\ValidationException::withMessages([
                        'items' => ["Insufficient stock for {$product->name}. Available: {$product->stock}"],
                    ]);
                }

                $lineTotal = $product->price * $item['quantity'];
                $subtotal += $lineTotal;

                $saleItems[] = [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'quantity' => $item['quantity'],
                    'price' => $product->price,
                    'total' => $lineTotal,
                ];

                $product->decrement('stock', $item['quantity']);
            }

            $vatAmount = round($subtotal * $vatRate / 100, 2);
            $total = $subtotal + $vatAmount;

            $sale = Sale::create([
                'receipt_number' => $receiptNumber,
                'user_id' => $request->user()->id,
                'subtotal' => $subtotal,
                'vat_rate' => $vatRate,
                'vat_amount' => $vatAmount,
                'total' => $total,
                'payment_method' => $request->payment_method ?? 'cash',
                'status' => 'completed',
                'sync_status' => 'synced',
                'local_id' => $request->local_id,
                'sale_date' => $request->sale_date,
                'sale_time' => $request->sale_time,
            ]);

            $sale->items()->createMany($saleItems);

            return response()->json(
                $sale->load('items'),
                201
            );
        });
    }

    public function show(Sale $sale)
    {
        return response()->json($sale->load(['items', 'user']));
    }

    public function sync(Request $request)
    {
        $request->validate([
            'sales' => 'required|array',
            'sales.*.local_id' => 'required|string',
            'sales.*.items' => 'required|array',
            'sales.*.items.*.product_id' => 'required|integer',
            'sales.*.items.*.quantity' => 'required|integer|min:1',
            'sales.*.items.*.price' => 'nullable|numeric|min:0',
            'sales.*.items.*.total' => 'nullable|numeric|min:0',
            'sales.*.subtotal' => 'nullable|numeric|min:0',
            'sales.*.vat_rate' => 'nullable|numeric|min:0|max:100',
            'sales.*.vat_amount' => 'nullable|numeric|min:0',
            'sales.*.total' => 'nullable|numeric|min:0',
            'sales.*.sale_date' => 'nullable|date',
            'sales.*.sale_time' => 'nullable|string',
        ]);

        $defaultVatRate = (float) Setting::getValue('vat_rate', '15');
        $results = [];

        foreach ($request->sales as $offlineSale) {
            try {
                $receiptNumber = 'RCP-' . strtoupper(Str::random(8));

                $sale = DB::transaction(function () use ($offlineSale, $defaultVatRate, $receiptNumber, $request) {
                    $subtotal = 0;
                    $saleItems = [];

                    foreach ($offlineSale['items'] as $item) {
                        $product = Product::lockForUpdate()->find($item['product_id']);

                        if (!$product || $product->stock < $item['quantity']) {
                            throw new \Exception(
                                "Insufficient stock for product ID {$item['product_id']}"
                            );
                        }

                        $unitPrice = isset($item['price'])
                            ? (float) $item['price']
                            : (float) $product->price;

                        $lineTotal = isset($item['total'])
                            ? (float) $item['total']
                            : round($unitPrice * $item['quantity'], 2);

                        $subtotal += $lineTotal;

                        $saleItems[] = [
                            'product_id' => $product->id,
                            'product_name' => $product->name,
                            'quantity' => $item['quantity'],
                            'price' => $unitPrice,
                            'total' => $lineTotal,
                        ];

                        $product->decrement('stock', $item['quantity']);
                    }

                    $subtotal = round($subtotal, 2);
                    $vatRate = isset($offlineSale['vat_rate'])
                        ? (float) $offlineSale['vat_rate']
                        : $defaultVatRate;

                    $vatAmount = isset($offlineSale['vat_amount'])
                        ? (float) $offlineSale['vat_amount']
                        : round($subtotal * $vatRate / 100, 2);

                    $total = isset($offlineSale['total'])
                        ? (float) $offlineSale['total']
                        : round($subtotal + $vatAmount, 2);

                    $sale = Sale::create([
                        'receipt_number' => $receiptNumber,
                        'user_id' => $request->user()->id,
                        'subtotal' => $subtotal,
                        'vat_rate' => $vatRate,
                        'vat_amount' => $vatAmount,
                        'total' => $total,
                        'payment_method' => $offlineSale['payment_method'] ?? 'cash',
                        'status' => 'completed',
                        'sync_status' => 'synced',
                        'local_id' => $offlineSale['local_id'],
                        'sale_date' => $offlineSale['sale_date'] ?? null,
                        'sale_time' => $offlineSale['sale_time'] ?? null,
                    ]);

                    $sale->items()->createMany($saleItems);

                    return $sale;
                });

                $results[] = [
                    'local_id' => $offlineSale['local_id'],
                    'server_id' => $sale->id,
                    'receipt_number' => $sale->receipt_number,
                    'status' => 'synced',
                ];
            } catch (\Exception $e) {
                $results[] = [
                    'local_id' => $offlineSale['local_id'],
                    'status' => 'failed',
                    'error' => $e->getMessage(),
                ];
            }
        }

        return response()->json(['results' => $results]);
    }
}
