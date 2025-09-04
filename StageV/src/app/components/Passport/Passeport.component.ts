// Passeport.component.ts
import { Component, OnInit } from '@angular/core';
import { PassportControllerService } from '../../services/services/passport-controller.service';
import { Passport } from '../../services/models/passport';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-Passeport',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './Passeport.component.html',
  styleUrls: ['./Passeport.component.css']
})
export class PasseportComponent implements OnInit {

  passports: Passport[] = [];
  newPassport: Passport = {};
  successMessage: string | null = null;
  fieldErrors: { [key: string]: string } = {};

  constructor(private passportService: PassportControllerService) {}

  ngOnInit(): void {
    this.loadPassports();
  }

  loadPassports(): void {
    this.passportService.getAll().subscribe({
      next: (data) => this.passports = data,
      error: (err) => console.error('Erreur lors du chargement des passeports', err)
    });
  }

  // Validation en temps réel pour chaque champ
  validateField(fieldName: string, value: any): void {
    // Supprimer l'erreur existante pour ce champ
    delete this.fieldErrors[fieldName];

    switch (fieldName) {
      case 'firstName':
        if (!value || value.trim().length < 2) {
          this.fieldErrors[fieldName] = 'Le prénom doit contenir au moins 2 caractères';
        } else if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(value)) {
          this.fieldErrors[fieldName] = 'Le prénom ne doit contenir que des lettres';
        }
        break;

      case 'lastName':
        if (!value || value.trim().length < 2) {
          this.fieldErrors[fieldName] = 'Le nom doit contenir au moins 2 caractères';
        } else if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(value)) {
          this.fieldErrors[fieldName] = 'Le nom ne doit contenir que des lettres';
        }
        break;

      case 'nationality':
        if (!value || value.trim().length < 2) {
          this.fieldErrors[fieldName] = 'La nationalité est obligatoire';
        } else if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(value)) {
          this.fieldErrors[fieldName] = 'La nationalité ne doit contenir que des lettres';
        }
        break;

      case 'sex':
        if (!value) {
          this.fieldErrors[fieldName] = 'Le sexe est obligatoire';
        }
        break;

      case 'dateOfBirth':
        if (!value) {
          this.fieldErrors[fieldName] = 'La date de naissance est obligatoire';
        } else {
          const birthDate = new Date(value);
          const today = new Date();
          const maxAge = new Date();
          maxAge.setFullYear(today.getFullYear() - 150);

          if (birthDate > today) {
            this.fieldErrors[fieldName] = 'La date ne peut pas être dans le futur';
          } else if (birthDate < maxAge) {
            this.fieldErrors[fieldName] = 'Date trop ancienne (max 150 ans)';
          }
        }
        break;

      case 'placeOfBirth':
        if (!value || value.trim().length < 2) {
          this.fieldErrors[fieldName] = 'Le lieu de naissance est obligatoire';
        }
        break;

      case 'address':
        if (!value || value.trim().length < 5) {
          this.fieldErrors[fieldName] = 'L\'adresse doit contenir au moins 5 caractères';
        }
        break;

      case 'dateOfIssue':
        if (!value) {
          this.fieldErrors[fieldName] = 'La date de délivrance est obligatoire';
        } else {
          const issueDate = new Date(value);
          const today = new Date();
          const maxPastDate = new Date();
          maxPastDate.setFullYear(today.getFullYear() - 20);

          if (issueDate > today) {
            this.fieldErrors[fieldName] = 'La date ne peut pas être dans le futur';
          } else if (issueDate < maxPastDate) {
            this.fieldErrors[fieldName] = 'Date trop ancienne (max 20 ans)';
          }
        }
        break;

      case 'dateOfExpiry':
        if (!value) {
          this.fieldErrors[fieldName] = 'La date d\'expiration est obligatoire';
        } else {
          const expiryDate = new Date(value);
          const today = new Date();

          // Vérifier si la date est dans le passé
          if (expiryDate < today) {
            this.fieldErrors[fieldName] = 'Le passeport est déjà expiré';
          } else {
            // Calculer la date dans 6 mois à partir d'aujourd'hui
            const sixMonthsFromNow = new Date();
            sixMonthsFromNow.setMonth(today.getMonth() + 6);

            // Si la date d'expiration est dans moins de 6 mois
            if (expiryDate <= sixMonthsFromNow) {
              this.fieldErrors[fieldName] = '⚠️ ATTENTION: Ce passeport expire dans moins de 6 mois !';
            }
          }

          // Vérifier aussi que c'est après la date de délivrance
          if (this.newPassport.dateOfIssue) {
            const issueDate = new Date(this.newPassport.dateOfIssue);
            if (expiryDate <= issueDate) {
              this.fieldErrors[fieldName] = 'Doit être après la date de délivrance';
            }
          }
        }
        break;

      case 'issuingAuthority':
        if (!value || value.trim().length < 3) {
          this.fieldErrors[fieldName] = 'Autorité obligatoire (min 3 caractères)';
        }
        break;
      case 'passportNumber':
        if (!value || value <= 0) {
          this.fieldErrors[fieldName] = 'Le numéro de passeport est obligatoire et doit être positif';
        }
        break;

      case 'occupation':
        if (value && value.trim().length > 100) {
          this.fieldErrors[fieldName] = 'La profession ne doit pas dépasser 100 caractères';
        }
        break;

    }
  }
  isExpiringWithinSixMonths(fieldName: string): boolean {
    if (fieldName === 'dateOfExpiry' && this.newPassport.dateOfExpiry) {
      const expiryDate = new Date(this.newPassport.dateOfExpiry);
      const today = new Date();
      const sixMonthsFromNow = new Date();
      sixMonthsFromNow.setMonth(today.getMonth() + 6);

      return expiryDate <= sixMonthsFromNow && expiryDate >= today;
    }
    return false;
  }

// Méthode pour obtenir le nombre de jours restants avant expiration
  getDaysUntilExpiry(): number | null {
    if (this.newPassport.dateOfExpiry) {
      const expiryDate = new Date(this.newPassport.dateOfExpiry);
      const today = new Date();
      const diffTime = expiryDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }
    return null;
  }

  // Validation complète du formulaire
  validateForm(): boolean {
    this.fieldErrors = {};

    // Valider tous les champs
    this.validateField('firstName', this.newPassport.firstName);
    this.validateField('lastName', this.newPassport.lastName);
    this.validateField('nationality', this.newPassport.nationality);
    this.validateField('sex', this.newPassport.sex);
    this.validateField('dateOfBirth', this.newPassport.dateOfBirth);
    this.validateField('placeOfBirth', this.newPassport.placeOfBirth);
    this.validateField('address', this.newPassport.address);
    this.validateField('dateOfIssue', this.newPassport.dateOfIssue);
    this.validateField('dateOfExpiry', this.newPassport.dateOfExpiry);
    this.validateField('issuingAuthority', this.newPassport.issuingAuthority);
    this.validateField('passportNumber', this.newPassport.passportNumber);
    this.validateField('occupation', this.newPassport.occupation);


    return Object.keys(this.fieldErrors).length === 0;
  }

  onSubmit(): void {
    this.successMessage = null;

    // Nettoyer les espaces
    if (this.newPassport.firstName) this.newPassport.firstName = this.newPassport.firstName.trim();
    if (this.newPassport.lastName) this.newPassport.lastName = this.newPassport.lastName.trim();
    if (this.newPassport.nationality) this.newPassport.nationality = this.newPassport.nationality.trim();
    if (this.newPassport.placeOfBirth) this.newPassport.placeOfBirth = this.newPassport.placeOfBirth.trim();
    if (this.newPassport.address) this.newPassport.address = this.newPassport.address.trim();
    if (this.newPassport.issuingAuthority) this.newPassport.issuingAuthority = this.newPassport.issuingAuthority.trim();

    // Valider
    if (!this.validateForm()) {
      return;
    }

    // Créer le passeport
    this.passportService.create({ body: this.newPassport }).subscribe({
      next: (created) => {
        this.passports.push(created);
        this.newPassport = {};
        this.fieldErrors = {};
        this.successMessage = "✅ Passeport créé avec succès !";
        setTimeout(() => this.successMessage = null, 4000);
      },
      error: (err) => {
        console.error('Erreur lors de la création du passeport', err);
      }
    });
  }

  // Méthodes utilitaires
  hasFieldError(fieldName: string): boolean {
    return !!this.fieldErrors[fieldName];
  }

  getFieldError(fieldName: string): string {
    return this.fieldErrors[fieldName] || '';
  }

  closeSuccessMessage(): void {
    this.successMessage = null;
  }
}
