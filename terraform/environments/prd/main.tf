# 1. 最小構成のネットワーク
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
}
resource "aws_internet_gateway" "gw" {
  vpc_id = aws_vpc.main.id
}
resource "aws_subnet" "pub" {
  vpc_id = aws_vpc.main.id
  cidr_block = "10.0.1.0/24"
  map_public_ip_on_launch = true
}
resource "aws_route_table" "rt" {
  vpc_id = aws_vpc.main.id
}
resource "aws_route" "r" {
  route_table_id = aws_route_table.rt.id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id = aws_internet_gateway.gw.id
}
resource "aws_route_table_association" "a" {
  subnet_id = aws_subnet.pub.id
  route_table_id = aws_route_table.rt.id
}

# 1. SSM用のIAMロール作成
resource "aws_iam_role" "ssm_role" {
  name = "transcribe-ssm-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
    }]
  })
}

# SSM公式ポリシーのアタッチ
resource "aws_iam_role_policy_attachment" "ssm_attach" {
  role       = aws_iam_role.ssm_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

# インスタンスプロファイル（EC2にロールを紐付けるための箱）
resource "aws_iam_instance_profile" "ssm_profile" {
  name = "transcribe-ssm-profile"
  role = aws_iam_role.ssm_role.name
}

# Elastic IP の作成
resource "aws_eip" "app_eip" {
  instance = aws_instance.app.id
  domain   = "vpc"
}

# 2. Elastic IP を EC2 に関連付け
resource "aws_eip_association" "eip_assoc" {
  instance_id   = aws_instance.app.id
  allocation_id = aws_eip.app_eip.id
}

# Route 53 ホストゾーンの作成（ドメインの管理場所）
resource "aws_route53_zone" "main" {
  name = "ultive.info"
}

# Aレコードの作成（ドメイン名を Elastic IP に紐付ける）
resource "aws_route53_record" "www" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "ultive.info" # サブドメインなし。www.ultive.info にしたい場合は "www" に変更
  type    = "A"
  ttl     = "300"
  records = [aws_eip.app_eip.public_ip]
}

# 2. セキュリティグループ
resource "aws_security_group" "sg" {
  name        = "transcribe-app-sg"
  description = "Allow HTTP and SSH"
  vpc_id      = aws_vpc.main.id

  # HTTP (Next.jsアプリ用)
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # アウトバウンド（API呼び出し等に必要）
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# 3. EC2 インスタンス (Amazon Linux 2023)
resource "aws_instance" "app" {
  ami           = "ami-0a68dd57c124abef3" # 東京リージョンのAmazon Linux 2023 AMI ID
  instance_type = "t4g.small"
  subnet_id     = aws_subnet.pub.id
  vpc_security_group_ids = [aws_security_group.sg.id]
  iam_instance_profile = aws_iam_instance_profile.ssm_profile.name # ロール付与

  user_data = <<-EOF
              #!/bin/bash
              dnf update -y
              EOF

  tags = { Name = "TranscribeServer" }
}
