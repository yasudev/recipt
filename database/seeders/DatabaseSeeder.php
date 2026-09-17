<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Database\Seed;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seed
{
    public function run(): void
    {
        User::create([
            'name' => 'Admin',
            'email' => 'admin@pos.com',
            'password' => Hash::make('password'),
        ]);

        $products = [
            ['name' => 'Water Bottle', 'sku' => 'WB001', 'price' => 1.00, 'stock' => 100],
            ['name' => 'Orange Juice', 'sku' => 'OJ001', 'price' => 3.50, 'stock' => 50],
            ['name' => 'Coffee', 'sku' => 'CF001', 'price' => 5.00, 'stock' => 80],
            ['name' => 'Sandwich', 'sku' => 'SW001', 'price' => 8.00, 'stock' => 30],
            ['name' => 'Burger', 'sku' => 'BG001', 'price' => 12.00, 'stock' => 25],
            ['name' => 'Pizza Slice', 'sku' => 'PZ001', 'price' => 6.00, 'stock' => 40],
            ['name' => 'Chips', 'sku' => 'CH001', 'price' => 2.50, 'stock' => 60],
            ['name' => 'Chocolate Bar', 'sku' => 'CB001', 'price' => 3.00, 'stock' => 45],
        ];

        foreach ($products as $product) {
            Product::create($product);
        }

        $settings = [
            ['key' => 'company_name', 'value' => 'YumInventory POS'],
            ['key' => 'company_address', 'value' => '123 Main Street, Riyadh, KSA'],
            ['key' => 'company_phone', 'value' => '+966 50 000 0000'],
            ['key' => 'company_email', 'value' => 'info@yuminventory.com'],
            ['key' => 'vat_rate', 'value' => '15'],
            ['key' => 'receipt_footer', 'value' => 'Thank you for your purchase!'],
            ['key' => 'currency', 'value' => 'SAR'],
            ['key' => 'currency_symbol', 'value' => 'ر.س'],
        ];

        foreach ($settings as $setting) {
            Setting::create($setting);
        }
    }
}
