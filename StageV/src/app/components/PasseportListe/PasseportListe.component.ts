import { Component, OnInit } from '@angular/core';
import { PassportControllerService } from '../../services/services/passport-controller.service';
import { Passport } from '../../services/models/passport';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-passeportliste',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './PasseportListe.component.html',
  styleUrls: ['./PasseportListe.component.css']
})
export class PasseportListeComponent implements OnInit {
  passports: Passport[] = [];
  selectedPassport: Passport | null = null;

  viewPassport(passport: Passport) {
    this.selectedPassport = passport;
  }
  ///////////////////////////////////////////////////
  selectedIndex: number | null = null;

  viewDetails(event: MouseEvent, index: number) {
    event.stopPropagation(); // Empêche le toggle de la ligne parent
    this.selectedIndex = (this.selectedIndex === index) ? null : index;
  }

  toggleDetails(index: number) {
    // Si tu veux aussi toggle en cliquant sur la ligne entière (optionnel)
    if(this.selectedIndex === index){
      this.selectedIndex = null;
    }
  }
/////////////////////////////////////////////////////////

  constructor(private passportService: PassportControllerService) {}

  ngOnInit(): void {
    this.loadPassports();
  }

  loadPassports(): void {
    this.passportService.getAll().subscribe((data: Blob | Passport[]) => {
      if (data instanceof Blob) {
        data.text().then(text => {
          this.passports = JSON.parse(text) as Passport[];
          console.log('Passports reçus :', this.passports);
        });
      } else {
        // Cas où le service renverrait déjà un tableau JSON
        this.passports = data;
      }
    });

  }

  deletePassport(id: number): void {
    this.passportService.delete({ id }).subscribe({
      next: () => {
        this.passports = this.passports.filter(p => p.id !== id);
      },
      error: (err) => {
        console.error('Erreur lors de la suppression du passeport', err);
      }
    });

  }goToCreate(): void {
    window.location.href = '/passport';
  }

}
