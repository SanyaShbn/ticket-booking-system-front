import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './app/interceptors/auth.interceptor';
import {
  TranslateLoader,
  TranslateService,
  TranslateStore,
  TranslateCompiler,
  TranslateFakeCompiler,
  TranslateParser,
  TranslateDefaultParser,
  MissingTranslationHandler,
  FakeMissingTranslationHandler,
  USE_DEFAULT_LANG,
  ISOLATE_TRANSLATE_SERVICE,
  USE_EXTEND,
  DEFAULT_LANGUAGE
} from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';

// Фабрика для загрузки переводов из JSON
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './i18n/', '.json');
}

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideAnimationsAsync(),
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    {
      provide: TranslateLoader,
      useFactory: HttpLoaderFactory,
      deps: [HttpClient]
    },
    { provide: TranslateCompiler, useClass: TranslateFakeCompiler },
    { provide: TranslateParser, useClass: TranslateDefaultParser },
    { provide: MissingTranslationHandler, useClass: FakeMissingTranslationHandler },
    { provide: USE_DEFAULT_LANG, useValue: true },
    { provide: ISOLATE_TRANSLATE_SERVICE, useValue: false },
    { provide: USE_EXTEND, useValue: true },
    { provide: DEFAULT_LANGUAGE, useValue: 'en' }, // Язык по умолчанию
    TranslateService,
    TranslateStore
  ]
});