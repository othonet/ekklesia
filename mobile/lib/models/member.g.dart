// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'member.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Member _$MemberFromJson(Map<String, dynamic> json) => Member(
  id: json['id'] as String,
  name: json['name'] as String,
  email: json['email'] as String?,
  phone: json['phone'] as String?,
  phone2: json['phone2'] as String?,
  birthDate: json['birthDate'] == null
      ? null
      : DateTime.parse(json['birthDate'] as String),
  address: json['address'] as String?,
  city: json['city'] as String?,
  state: json['state'] as String?,
  zipCode: json['zipCode'] as String?,
  status: json['status'] as String,
  memberSince: json['memberSince'] == null
      ? null
      : DateTime.parse(json['memberSince'] as String),
  createdAt: DateTime.parse(json['createdAt'] as String),
  updatedAt: DateTime.parse(json['updatedAt'] as String),
  maritalStatus: json['maritalStatus'] as String?,
  profession: json['profession'] as String?,
  education: json['education'] as String?,
  emergencyContact: json['emergencyContact'] as String?,
  emergencyPhone: json['emergencyPhone'] as String?,
  dataConsent: json['dataConsent'] as bool,
  consentDate: json['consentDate'] == null
      ? null
      : DateTime.parse(json['consentDate'] as String),
  church: json['church'] == null
      ? null
      : Church.fromJson(json['church'] as Map<String, dynamic>),
  ministries: (json['ministries'] as List<dynamic>?)
      ?.map((e) => MinistryInfo.fromJson(e as Map<String, dynamic>))
      .toList(),
  donations: (json['donations'] as List<dynamic>?)
      ?.map((e) => Donation.fromJson(e as Map<String, dynamic>))
      .toList(),
  courses: (json['courses'] as List<dynamic>?)
      ?.map((e) => CourseInfo.fromJson(e as Map<String, dynamic>))
      .toList(),
  certificates: (json['certificates'] as List<dynamic>?)
      ?.map((e) => Certificate.fromJson(e as Map<String, dynamic>))
      .toList(),
);

Map<String, dynamic> _$MemberToJson(Member instance) => <String, dynamic>{
  'id': instance.id,
  'name': instance.name,
  'email': instance.email,
  'phone': instance.phone,
  'phone2': instance.phone2,
  'birthDate': instance.birthDate?.toIso8601String(),
  'address': instance.address,
  'city': instance.city,
  'state': instance.state,
  'zipCode': instance.zipCode,
  'status': instance.status,
  'memberSince': instance.memberSince?.toIso8601String(),
  'createdAt': instance.createdAt.toIso8601String(),
  'updatedAt': instance.updatedAt.toIso8601String(),
  'maritalStatus': instance.maritalStatus,
  'profession': instance.profession,
  'education': instance.education,
  'emergencyContact': instance.emergencyContact,
  'emergencyPhone': instance.emergencyPhone,
  'dataConsent': instance.dataConsent,
  'consentDate': instance.consentDate?.toIso8601String(),
  'church': instance.church,
  'ministries': instance.ministries,
  'donations': instance.donations,
  'courses': instance.courses,
  'certificates': instance.certificates,
};

Church _$ChurchFromJson(Map<String, dynamic> json) =>
    Church(id: json['id'] as String, name: json['name'] as String);

Map<String, dynamic> _$ChurchToJson(Church instance) => <String, dynamic>{
  'id': instance.id,
  'name': instance.name,
};

MinistryInfo _$MinistryInfoFromJson(Map<String, dynamic> json) => MinistryInfo(
  id: json['id'] as String,
  name: json['name'] as String,
  description: json['description'] as String?,
  role: json['role'] as String?,
  joinedAt: DateTime.parse(json['joinedAt'] as String),
  leader: json['leader'] as Map<String, dynamic>?,
);

Map<String, dynamic> _$MinistryInfoToJson(MinistryInfo instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'description': instance.description,
      'role': instance.role,
      'joinedAt': instance.joinedAt.toIso8601String(),
      'leader': instance.leader,
    };

Donation _$DonationFromJson(Map<String, dynamic> json) => Donation(
  id: json['id'] as String,
  amount: (json['amount'] as num).toDouble(),
  date: DateTime.parse(json['date'] as String),
  method: json['method'] as String?,
  notes: json['notes'] as String?,
  type: json['type'] as String,
);

Map<String, dynamic> _$DonationToJson(Donation instance) => <String, dynamic>{
  'id': instance.id,
  'amount': instance.amount,
  'date': instance.date.toIso8601String(),
  'method': instance.method,
  'notes': instance.notes,
  'type': instance.type,
};

CourseInfo _$CourseInfoFromJson(Map<String, dynamic> json) => CourseInfo(
  id: json['id'] as String,
  name: json['name'] as String,
  description: json['description'] as String?,
  startDate: DateTime.parse(json['startDate'] as String),
  endDate: json['endDate'] == null
      ? null
      : DateTime.parse(json['endDate'] as String),
  status: json['status'] as String,
  grade: json['grade'] as String?,
  certificate: json['certificate'] as bool,
  certificateData: json['certificateData'] == null
      ? null
      : Certificate.fromJson(json['certificateData'] as Map<String, dynamic>),
);

Map<String, dynamic> _$CourseInfoToJson(CourseInfo instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'description': instance.description,
      'startDate': instance.startDate.toIso8601String(),
      'endDate': instance.endDate?.toIso8601String(),
      'status': instance.status,
      'grade': instance.grade,
      'certificate': instance.certificate,
      'certificateData': instance.certificateData,
    };

Certificate _$CertificateFromJson(Map<String, dynamic> json) => Certificate(
  id: json['id'] as String,
  type: json['type'] as String,
  title: json['title'] as String,
  description: json['description'] as String?,
  certificateNumber: json['certificateNumber'] as String,
  validationHash: json['validationHash'] as String,
  qrCodeUrl: json['qrCodeUrl'] as String?,
  issuedDate: DateTime.parse(json['issuedDate'] as String),
  issuedBy: json['issuedBy'] as String?,
  validUntil: json['validUntil'] == null
      ? null
      : DateTime.parse(json['validUntil'] as String),
  active: json['active'] as bool,
  revoked: json['revoked'] as bool,
  baptism: json['baptism'] == null
      ? null
      : BaptismInfo.fromJson(json['baptism'] as Map<String, dynamic>),
  course: json['course'] == null
      ? null
      : CourseBasicInfo.fromJson(json['course'] as Map<String, dynamic>),
  event: json['event'] == null
      ? null
      : EventInfo.fromJson(json['event'] as Map<String, dynamic>),
  church: json['church'] == null
      ? null
      : Church.fromJson(json['church'] as Map<String, dynamic>),
);

Map<String, dynamic> _$CertificateToJson(Certificate instance) =>
    <String, dynamic>{
      'id': instance.id,
      'type': instance.type,
      'title': instance.title,
      'description': instance.description,
      'certificateNumber': instance.certificateNumber,
      'validationHash': instance.validationHash,
      'qrCodeUrl': instance.qrCodeUrl,
      'issuedDate': instance.issuedDate.toIso8601String(),
      'issuedBy': instance.issuedBy,
      'validUntil': instance.validUntil?.toIso8601String(),
      'active': instance.active,
      'revoked': instance.revoked,
      'baptism': instance.baptism,
      'course': instance.course,
      'event': instance.event,
      'church': instance.church,
    };

BaptismInfo _$BaptismInfoFromJson(Map<String, dynamic> json) => BaptismInfo(
  date: DateTime.parse(json['date'] as String),
  location: json['location'] as String?,
  minister: json['minister'] as String?,
);

Map<String, dynamic> _$BaptismInfoToJson(BaptismInfo instance) =>
    <String, dynamic>{
      'date': instance.date.toIso8601String(),
      'location': instance.location,
      'minister': instance.minister,
    };

CourseBasicInfo _$CourseBasicInfoFromJson(Map<String, dynamic> json) =>
    CourseBasicInfo(
      name: json['name'] as String,
      description: json['description'] as String?,
    );

Map<String, dynamic> _$CourseBasicInfoToJson(CourseBasicInfo instance) =>
    <String, dynamic>{
      'name': instance.name,
      'description': instance.description,
    };

EventInfo _$EventInfoFromJson(Map<String, dynamic> json) => EventInfo(
  id: json['id'] as String,
  title: json['title'] as String,
  description: json['description'] as String?,
  dateString: json['date'] as String,
  location: json['location'] as String?,
  type: json['type'] as String?,
  hasAttendance: json['hasAttendance'] as bool?,
  attendance: json['attendance'] as Map<String, dynamic>?,
);

Map<String, dynamic> _$EventInfoToJson(EventInfo instance) => <String, dynamic>{
  'id': instance.id,
  'title': instance.title,
  'description': instance.description,
  'date': instance.dateString,
  'location': instance.location,
  'type': instance.type,
  'hasAttendance': instance.hasAttendance,
  'attendance': instance.attendance,
};
