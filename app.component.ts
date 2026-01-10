import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector:  'app-root',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-purple-900 to-black">
      <nav class="bg-black border-b border-purple-500">
        <div class="max-w-7xl mx-auto px-4">
          <h1 class="text-white text-2xl font-bold py-4">Platinum Store Pro</h1>
        </div>
      </nav>
      <main class="max-w-7xl mx-auto p-4">
        <h2 class="text-white text-3xl mb-8">Welcome</h2>
        <p class="text-gray-300">Your store is ready! </p>
      </main>
    </div>
  `,
  styles: []
})
export class AppComponent {}