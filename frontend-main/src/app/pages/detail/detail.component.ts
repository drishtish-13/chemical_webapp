import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CompoundsService, Compound } from '../../services/compounds.service';
import { ModalService } from '../../shared/modal/modal.service';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css']
})
export class DetailComponent implements OnInit {
  compound?: Compound;
  id!: number;
  loading = false;
  imageError = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private svc: CompoundsService,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadCompound();
  }

  loadCompound(): void {
    this.loading = true;
    this.svc.get(this.id).subscribe({
      next: (res) => {
        this.compound = res;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.modalService.showError('Error', 'Failed to load compound details. Please try again.');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/compounds']);
  }

  editCompound(): void {
    this.router.navigate(['/compounds', this.id, 'edit']);
  }

  onImageError(event: any): void {
    this.imageError = true;
    console.log(`Image failed to load: ${event.target.src}`);
  }

  onImageLoad(event: any): void {
    console.log(`Image loaded successfully: ${event.target.src}`);
  }
}
