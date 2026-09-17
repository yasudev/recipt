<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function index()
    {
        $settings = Setting::pluck('value', 'key')->toArray();

        $defaults = [
            'company_name' => 'YumInventory POS',
            'company_address' => '',
            'company_phone' => '',
            'company_email' => '',
            'vat_rate' => '15',
            'receipt_footer' => 'Thank you for your purchase!',
            'currency' => 'SAR',
            'currency_symbol' => 'ر.س',
        ];

        return response()->json(array_merge($defaults, $settings));
    }

    public function update(Request $request)
    {
        $request->validate([
            'company_name' => 'nullable|string',
            'company_address' => 'nullable|string',
            'company_phone' => 'nullable|string',
            'company_email' => 'nullable|string',
            'vat_rate' => 'nullable|numeric|min:0|max:100',
            'receipt_footer' => 'nullable|string',
            'currency' => 'nullable|string',
            'currency_symbol' => 'nullable|string',
        ]);

        foreach ($request->only([
            'company_name', 'company_address', 'company_phone',
            'company_email', 'vat_rate', 'receipt_footer',
            'currency', 'currency_symbol'
        ]) as $key => $value) {
            if ($value !== null) {
                Setting::setValue($key, $value);
            }
        }

        return response()->json(['message' => 'Settings updated']);
    }
}
