import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";


export enum Visibility {
    PUBLIC = "public",
    FRIENDS = "friends",
    PRIVATE = "private",
}


@Entity()
export class User{

    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column({ type: "enum", enum: Visibility, default: Visibility.PUBLIC })
    name_visibility!: Visibility;

    @Column()
    surname!: string;

    @Column({ type: "enum", enum: Visibility, default: Visibility.PUBLIC })
    surname_visibility!: Visibility;

    @Column({ unique: true })
    username!: string;

    @Column({ type: "enum", enum: Visibility, default: Visibility.PUBLIC })
    username_visibility!: Visibility;

    @Column({ unique: true, nullable: true })
    email!: string;

    @Column({ type: "enum", enum: Visibility, default: Visibility.PRIVATE })
    email_visibility!: Visibility;

    @Column({ nullable: true, select: false })
    password!: string;  

    @Column({ default: false })
    is_email_verified!: boolean;

    @Column({ nullable: true })
    email_verification_token!: string;

    @Column({ nullable: true, type: "timestamp" })
    email_verification_expires!: Date;

    @CreateDateColumn()
    created_date!: Date;

    @Column({ type: "enum", enum: Visibility, default: Visibility.PRIVATE })
    created_date_visibility!: Visibility;

    @UpdateDateColumn()
    updated_date!: Date;

    @Column({ nullable: true })
    profile_photo!: string;

    @Column({ type: "enum", enum: Visibility, default: Visibility.FRIENDS })
    profile_photo_visibility!: Visibility;

    @Column({ nullable: true })
    birth_date!: Date;

    @Column({ type: "enum", enum: Visibility, default: Visibility.FRIENDS })
    birth_date_visibility!: Visibility;

    @Column({ nullable: true })
    password_reset_token!: string;

    @Column({ nullable: true, type: "timestamp" })
    password_reset_expires!: Date;

    @Column({ nullable: true })
    google_id!: string;

    @Column({ default: "email"})
    auth_provider!: string;

    @Column({ nullable: true })
    facebook_id!: string;
}