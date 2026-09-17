<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Admin',
            'email' => 'admin@pos.com',
            'password' => Hash::make('password'),
        ]);

        $categories = [
            ['name' => 'Beverages', 'description' => 'Drinks and beverages'],
            ['name' => 'Food', 'description' => 'Food items'],
            ['name' => 'Snacks', 'description' => 'Snacks and treats'],
        ];

        foreach ($categories as $cat) {
            Category::create($cat);
        }

        $products = [
            ['name' => 'Water Bottle', 'sku' => 'WB001', 'category_id' => 1, 'price' => 1.00, 'stock' => 100],
            ['name' => 'Orange Juice', 'sku' => 'OJ001', 'category_id' => 1, 'price' => 3.50, 'stock' => 50],
            ['name' => 'Coffee', 'sku' => 'CF001', 'category_id' => 1, 'price' => 5.00, 'stock' => 80],
            ['name' => 'Sandwich', 'sku' => 'SW001', 'category_id' => 2, 'price' => 8.00, 'stock' => 30],
            ['name' => 'Burger', 'sku' => 'BG001', 'category_id' => 2, 'price' => 12.00, 'stock' => 25],
            ['name' => 'Pizza Slice', 'sku' => 'PZ001', 'category_id' => 2, 'price' => 6.00, 'stock' => 40],
            ['name' => 'Chips', 'sku' => 'CH001', 'category_id' => 3, 'price' => 2.50, 'stock' => 60],
            ['name' => 'Chocolate Bar', 'sku' => 'CB001', 'category_id' => 3, 'price' => 3.00, 'stock' => 45],
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
