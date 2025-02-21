import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ArenaService } from '../../services/arena.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Arena } from '../../models/arena.model';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { NgIf } from '@angular/common';
import { HttpClientModule } from '@angular/common/http'

@Component({
  selector: 'app-arena-form',
  templateUrl: './arena-form.component.html',
  styleUrls: ['./arena-form.component.css'],
  standalone: true,
  imports: [
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatButtonModule,
    ReactiveFormsModule,
    NgIf,
    HttpClientModule
  ]
})
export class ArenaFormComponent implements OnInit {
  arenaForm: FormGroup;
  arenaId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private arenaService: ArenaService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.arenaForm = this.fb.group({
      name: ['', Validators.required],
      city: ['', Validators.required],
      capacity: [0, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.arenaId = +id;
        this.arenaService.getArena(this.arenaId).subscribe(arena => {
          this.arenaForm.patchValue(arena);
        });
      }
    });
  }

  onSubmit(): void {
    if (this.arenaForm.valid) {
      const arena: Arena = this.arenaForm.value;
      if (this.arenaId) {
        this.arenaService.updateArena(this.arenaId, arena).subscribe(() => {
          this.router.navigate(['/arenas']);
        });
      } else {
        this.arenaService.createArena(arena).subscribe(() => {
          this.router.navigate(['/arenas']);
        });
      }
    }
  }

  cancel(): void {
    this.router.navigate(['/arenas']);
  }
}