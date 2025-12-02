import 'package:json_annotation/json_annotation.dart';

part 'member.g.dart';

@JsonSerializable()
class Member {
  final String id;
  final String name;
  final String? email;
  final String? phone;
  final String? phone2;
  final DateTime? birthDate;
  final String? address;
  final String? city;
  final String? state;
  final String? zipCode;
  final String status;
  final DateTime? memberSince;
  final DateTime createdAt;
  final DateTime updatedAt;
  
  // Dados adicionais
  final String? maritalStatus;
  final String? profession;
  final String? education;
  final String? emergencyContact;
  final String? emergencyPhone;
  
  // LGPD
  final bool dataConsent;
  final DateTime? consentDate;
  
  // Igreja
  final Church? church;
  
  // Relações (opcionais, podem não vir em todas as respostas)
  final List<MinistryInfo>? ministries;
  final List<Donation>? donations;
  final List<CourseInfo>? courses;
  final List<Certificate>? certificates;

  Member({
    required this.id,
    required this.name,
    this.email,
    this.phone,
    this.phone2,
    this.birthDate,
    this.address,
    this.city,
    this.state,
    this.zipCode,
    required this.status,
    this.memberSince,
    required this.createdAt,
    required this.updatedAt,
    this.maritalStatus,
    this.profession,
    this.education,
    this.emergencyContact,
    this.emergencyPhone,
    required this.dataConsent,
    this.consentDate,
    this.church,
    this.ministries,
    this.donations,
    this.courses,
    this.certificates,
  });

  factory Member.fromJson(Map<String, dynamic> json) => _$MemberFromJson(json);
  Map<String, dynamic> toJson() => _$MemberToJson(this);
}

@JsonSerializable()
class Church {
  final String id;
  final String name;

  Church({
    required this.id,
    required this.name,
  });

  factory Church.fromJson(Map<String, dynamic> json) => _$ChurchFromJson(json);
  Map<String, dynamic> toJson() => _$ChurchToJson(this);
}

@JsonSerializable()
class MinistryInfo {
  final String id;
  final String name;
  final String? description;
  final String? role;
  final DateTime joinedAt;

  MinistryInfo({
    required this.id,
    required this.name,
    this.description,
    this.role,
    required this.joinedAt,
  });

  factory MinistryInfo.fromJson(Map<String, dynamic> json) => _$MinistryInfoFromJson(json);
  Map<String, dynamic> toJson() => _$MinistryInfoToJson(this);
}

@JsonSerializable()
class Donation {
  final String id;
  final double amount;
  final DateTime date;
  final String? method;
  final String? notes;
  final String type;

  Donation({
    required this.id,
    required this.amount,
    required this.date,
    this.method,
    this.notes,
    required this.type,
  });

  factory Donation.fromJson(Map<String, dynamic> json) => _$DonationFromJson(json);
  Map<String, dynamic> toJson() => _$DonationToJson(this);
}

@JsonSerializable()
class CourseInfo {
  final String id;
  final String name;
  final String? description;
  final DateTime startDate;
  final DateTime? endDate;
  final String status;
  final String? grade;
  final bool certificate;
  final Certificate? certificateData;

  CourseInfo({
    required this.id,
    required this.name,
    this.description,
    required this.startDate,
    this.endDate,
    required this.status,
    this.grade,
    required this.certificate,
    this.certificateData,
  });

  factory CourseInfo.fromJson(Map<String, dynamic> json) => _$CourseInfoFromJson(json);
  Map<String, dynamic> toJson() => _$CourseInfoToJson(this);
}

@JsonSerializable()
class Certificate {
  final String id;
  final String type;
  final String title;
  final String? description;
  final String certificateNumber;
  final String validationHash;
  final String? qrCodeUrl;
  final DateTime issuedDate;
  final String? issuedBy;
  final DateTime? validUntil;
  final bool active;
  final bool revoked;
  
  // Relações opcionais
  final BaptismInfo? baptism;
  final CourseBasicInfo? course;
  final EventInfo? event;
  final Church? church;

  Certificate({
    required this.id,
    required this.type,
    required this.title,
    this.description,
    required this.certificateNumber,
    required this.validationHash,
    this.qrCodeUrl,
    required this.issuedDate,
    this.issuedBy,
    this.validUntil,
    required this.active,
    required this.revoked,
    this.baptism,
    this.course,
    this.event,
    this.church,
  });

  factory Certificate.fromJson(Map<String, dynamic> json) => _$CertificateFromJson(json);
  Map<String, dynamic> toJson() => _$CertificateToJson(this);
}

@JsonSerializable()
class BaptismInfo {
  final DateTime date;
  final String? location;
  final String? minister;

  BaptismInfo({
    required this.date,
    this.location,
    this.minister,
  });

  factory BaptismInfo.fromJson(Map<String, dynamic> json) => _$BaptismInfoFromJson(json);
  Map<String, dynamic> toJson() => _$BaptismInfoToJson(this);
}

@JsonSerializable()
class CourseBasicInfo {
  final String name;
  final String? description;

  CourseBasicInfo({
    required this.name,
    this.description,
  });

  factory CourseBasicInfo.fromJson(Map<String, dynamic> json) => _$CourseBasicInfoFromJson(json);
  Map<String, dynamic> toJson() => _$CourseBasicInfoToJson(this);
}

@JsonSerializable()
class EventInfo {
  final String id;
  final String title;
  final String? description;
  @JsonKey(name: 'date')
  final String dateString; // ISO string from API
  final String? location;
  final String? type;
  final bool? hasAttendance;
  final Map<String, dynamic>? attendance;

  EventInfo({
    required this.id,
    required this.title,
    this.description,
    required this.dateString,
    this.location,
    this.type,
    this.hasAttendance,
    this.attendance,
  });

  // Getter para converter string para DateTime
  DateTime get date => DateTime.parse(dateString);

  factory EventInfo.fromJson(Map<String, dynamic> json) => _$EventInfoFromJson(json);
  Map<String, dynamic> toJson() => _$EventInfoToJson(this);
}

