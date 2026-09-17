<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Sale;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $today = now()->toDateString();

        $totalSalesToday = Sale::whereDate('created_at', $today)
            ->where('status', 'completed')
            ->sum('total');

        $totalTransactionsToday = Sale::whereDate('created_at', $today)
            ->where('status', 'completed')
            ->count();

        $totalProducts = Product::count();

        $lowStockProducts = Product::where('stock', '<=', 5)
            ->where('is_active', true)
            ->count();

        $recentSales = Sale::with('items')
            ->where('status', 'completed')
            ->orderByDesc('created_at')
            ->limit(10)
            ->get();

        $monthlySales = Sale::where('status', 'completed')
            ->where('created_at', '>=', now()->startOfMonth())
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(total) as total'),
                DB::raw('COUNT(*) as count')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json([
            'total_sales_today' => $totalSalesToday,
            'total_transactions_today' => $totalTransactionsToday,
            'total_products' => $totalProducts,
            'low_stock_products' => $lowStockProducts,
            'recent_sales' => $recentSales,
            'monthly_sales' => $monthlySales,
        ]);
    }
}
