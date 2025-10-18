import { Component, OnInit } from '@angular/core';
import { CompoundsService, Compound } from '../../services/compounds.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ModalService } from '../../shared/modal/modal.service';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css']
})
export class GalleryComponent implements OnInit {
  compounds: Compound[] = [];
  page = 1;
  perPage = 10;
  total = 0;
  totalPages = 1;
  loading = false;
  pageNumbers: number[] = [];
  imageErrors: { [key: number]: boolean } = {};

  constructor(
    private svc: CompoundsService,
    private router: Router,
    private route: ActivatedRoute,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    // if URL contains ?page=, use it
    const qpPage = Number(this.route.snapshot.queryParamMap.get('page')) || 1;
    this.page = qpPage >= 1 ? qpPage : 1;
    this.load(this.page);
  }

  load(page = 1): void {
    this.loading = true;
    this.svc.getPage(page, this.perPage).subscribe({
      next: (res) => {
        this.compounds = res.compounds;
        this.page = res.meta.page;
        this.perPage = res.meta.per_page;
        this.total = res.meta.total;
        this.totalPages = res.meta.total_pages;
        this.pageNumbers = this.makePageNumbers(this.page, this.totalPages);
        this.loading = false;
        // push page param to URL without reloading component
        this.router.navigate([], { relativeTo: this.route, queryParams: { page: this.page }, replaceUrl: true });
        
        // Log image loading status
        console.log(`Loaded ${res.compounds.length} compounds for page ${page}`);
        console.log('Image URLs:', res.compounds.map(c => ({ id: c.id, name: c.name, image: c.image })));
      },
      error: (err) => {
        console.error('Failed to load compounds', err);
        this.loading = false;
        this.modalService.showError('Error', 'Failed to load compounds. Please try again.');
      }
    });
  }

  makePageNumbers(current: number, total: number): number[] {
    // show up to 7 page buttons (current centered when possible)
    const maxButtons = 7;
    const pages: number[] = [];
    if (total <= maxButtons) {
      for (let i = 1; i <= total; i++) pages.push(i);
      return pages;
    }
    let start = Math.max(1, current - Math.floor(maxButtons / 2));
    let end = start + maxButtons - 1;
    if (end > total) { end = total; start = end - maxButtons + 1; }
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  goToPage(p: number) {
    if (p < 1 || p > this.totalPages || p === this.page) return;
    this.load(p);
  }


  prev() { if (this.page > 1) this.load(this.page - 1); }
  next() { if (this.page < this.totalPages) this.load(this.page + 1); }
  first() { if (this.page !== 1) this.load(1); }
  last() { if (this.page !== this.totalPages) this.load(this.totalPages); }

  viewDetails(id: number) { this.router.navigate(['/compounds', id]); }

  onImageError(event: any) {
    const img = event.target;
    const compoundId = this.compounds.find(c => c.image === img.src)?.id;
    if (compoundId) {
      this.imageErrors[compoundId] = true;
      console.log(`Image failed to load for compound ${compoundId}: ${img.src}`);
      
      // Log summary of image loading status
      const totalImages = this.compounds.length;
      const failedImages = Object.keys(this.imageErrors).length;
      const successfulImages = totalImages - failedImages;
      console.log(`Image loading summary: ${successfulImages}/${totalImages} images loaded successfully`);
    }
  }

  onImageLoad(event: any) {
    const img = event.target;
    const compoundId = this.compounds.find(c => c.image === img.src)?.id;
    if (compoundId) {
      console.log(`Image loaded successfully for compound ${compoundId}: ${img.src}`);
    }
  }
}
